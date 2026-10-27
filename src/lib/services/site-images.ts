import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  cloneDefaultSiteImages,
  IMAGE_SLOTS_REGISTRY,
  VALID_IMAGE_SLOTS,
} from "@/config/site-config";
import {
  ImageSlotId,
  ImageSlotMetadata,
  SiteImagesMap,
} from "@/types/domain";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MIN_IMAGE_BYTES = 64;

export interface DetectedImageFormat {
  mime: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "png" | "webp";
}

/**
 * Inspección binaria de Magic Bytes (primeros 12 bytes).
 * Previene ataques de MIME-spoofing o subida de SVG/HTML con XSS.
 */
export function detectImageFormatFromBytes(
  bytes: Uint8Array
): DetectedImageFormat | null {
  if (bytes.length < 12) return null;

  // 1. JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }

  // 3. WebP: "RIFF" (0..3) + "WEBP" (8..11)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }

  return null;
}

export function sanitizeSlotText(input: unknown, maxLen: number): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\r\n\t<>]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxLen);
}

interface CloudinaryEnv {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function getCloudinaryConfig(): CloudinaryEnv | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }
  return null;
}

function signCloudinaryParams(
  params: Record<string, string>,
  apiSecret: string
): string {
  const sortedQuery = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHash("sha1")
    .update(sortedQuery + apiSecret)
    .digest("hex");
}

// Caché en memoria de corta duración para lecturas rápidas en Serverless y Local
let cachedSiteImages: { data: SiteImagesMap; expiresAt: number } | null = null;
const MEMORY_CACHE_TTL_MS = 60 * 1000;

export function invalidateSiteImagesMemoryCache(): void {
  cachedSiteImages = null;
}

const LOCAL_MANIFEST_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "site-images-manifest.json"
);
const LOCAL_UPLOADS_DIR = path.join(
  process.cwd(),
  "public",
  "images",
  "uploads"
);

async function readLocalManifest(): Promise<Partial<SiteImagesMap>> {
  try {
    const raw = await fs.readFile(LOCAL_MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteImagesMap>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLocalManifest(manifest: SiteImagesMap): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_MANIFEST_PATH), { recursive: true });
  await fs.writeFile(
    LOCAL_MANIFEST_PATH,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
}

interface CloudinaryResourceItem {
  public_id: string;
  secure_url: string;
  created_at?: string;
  context?: {
    custom?: {
      alt?: string;
      label?: string;
    };
  };
}

async function fetchCloudinarySlots(
  cfg: CloudinaryEnv
): Promise<Partial<SiteImagesMap>> {
  try {
    const basicAuth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString(
      "base64"
    );
    const url = new URL(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        cfg.cloudName
      )}/resources/image/upload`
    );
    url.searchParams.set("prefix", "odontoclinic/");
    url.searchParams.set("context", "true");
    url.searchParams.set("max_results", "30");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${basicAuth}` },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 },
    });

    if (!res.ok) return {};

    const json = (await res.json()) as { resources?: CloudinaryResourceItem[] };
    const result: Partial<SiteImagesMap> = {};

    for (const item of json.resources || []) {
      const slotCandidate = item.public_id.replace(/^odontoclinic\//, "");
      if (VALID_IMAGE_SLOTS.includes(slotCandidate as ImageSlotId)) {
        const slot = slotCandidate as ImageSlotId;
        const base = IMAGE_SLOTS_REGISTRY[slot];
        result[slot] = {
          ...base,
          src: item.secure_url,
          alt: item.context?.custom?.alt || base.alt,
          label: item.context?.custom?.label || base.label,
          updatedAt: item.created_at,
          storageProvider: "cloudinary",
        };
      }
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Obtiene el mapa completo de los 5 slots de imágenes combinando los valores
 * por defecto con cualquier imagen personalizada en Cloudinary o en el manifiesto local.
 */
export async function getSiteImages(): Promise<SiteImagesMap> {
  const now = Date.now();
  if (cachedSiteImages && now < cachedSiteImages.expiresAt) {
    return cachedSiteImages.data;
  }

  const merged = cloneDefaultSiteImages();
  const cloudinaryCfg = getCloudinaryConfig();

  if (cloudinaryCfg) {
    const cloudOverrides = await fetchCloudinarySlots(cloudinaryCfg);
    for (const slot of VALID_IMAGE_SLOTS) {
      if (cloudOverrides[slot]) {
        merged[slot] = cloudOverrides[slot] as ImageSlotMetadata;
      }
    }
  } else {
    const localOverrides = await readLocalManifest();
    for (const slot of VALID_IMAGE_SLOTS) {
      const override = localOverrides[slot];
      if (override && typeof override.src === "string") {
        merged[slot] = {
          ...merged[slot],
          src: override.src,
          alt: override.alt || merged[slot].alt,
          label: override.label || merged[slot].label,
          updatedAt: override.updatedAt,
          storageProvider: override.storageProvider || "local",
        };
      }
    }
  }

  cachedSiteImages = {
    data: merged,
    expiresAt: now + MEMORY_CACHE_TTL_MS,
  };

  return merged;
}

export interface UpdateSlotImageOptions {
  slot: ImageSlotId;
  bytes: Uint8Array;
  format: DetectedImageFormat;
  alt?: string;
  label?: string;
}

/**
 * Sube y reemplaza la imagen de un slot específico (Cloudinary en Serverless / Disco en Local).
 */
export async function updateSlotImage(
  options: UpdateSlotImageOptions
): Promise<ImageSlotMetadata> {
  const { slot, bytes, format, alt, label } = options;
  const baseMeta = IMAGE_SLOTS_REGISTRY[slot];
  const finalAlt = sanitizeSlotText(alt, 140) || baseMeta.alt;
  const finalLabel = sanitizeSlotText(label, 80) || baseMeta.label;
  const cloudinaryCfg = getCloudinaryConfig();

  // 1. Modo Serverless Cloud (Cloudinary)
  if (cloudinaryCfg) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const contextStr = `alt=${finalAlt.replace(/[|=]/g, " ")}|label=${(
      finalLabel || ""
    ).replace(/[|=]/g, " ")}`;

    const paramsToSign: Record<string, string> = {
      context: contextStr,
      folder: "odontoclinic",
      invalidate: "true",
      overwrite: "true",
      public_id: slot,
      timestamp,
    };

    const signature = signCloudinaryParams(
      paramsToSign,
      cloudinaryCfg.apiSecret
    );

    const base64DataUri = `data:${format.mime};base64,${Buffer.from(
      bytes
    ).toString("base64")}`;

    const form = new FormData();
    form.set("file", base64DataUri);
    form.set("api_key", cloudinaryCfg.apiKey);
    form.set("timestamp", timestamp);
    form.set("folder", "odontoclinic");
    form.set("public_id", slot);
    form.set("overwrite", "true");
    form.set("invalidate", "true");
    form.set("context", contextStr);
    form.set("signature", signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        cloudinaryCfg.cloudName
      )}/image/upload`,
      {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!uploadRes.ok) {
      throw new Error(
        `Error al subir la imagen a Cloudinary (HTTP ${uploadRes.status}).`
      );
    }

    const uploaded = (await uploadRes.json()) as {
      secure_url: string;
      created_at?: string;
    };

    const updatedMeta: ImageSlotMetadata = {
      ...baseMeta,
      src: uploaded.secure_url,
      alt: finalAlt,
      label: finalLabel,
      updatedAt: uploaded.created_at || new Date().toISOString(),
      storageProvider: "cloudinary",
    };

    invalidateSiteImagesMemoryCache();
    return updatedMeta;
  }

  // 2. Modo Local / VPS (Guarda en public/images/uploads/ y actualiza el manifiesto JSON)
  await fs.mkdir(LOCAL_UPLOADS_DIR, { recursive: true });

  // Eliminar archivos previos del mismo slot para no acumular basura
  try {
    const existingFiles = await fs.readdir(LOCAL_UPLOADS_DIR);
    for (const file of existingFiles) {
      if (file.startsWith(`${slot}-`)) {
        await fs
          .unlink(path.join(LOCAL_UPLOADS_DIR, file))
          .catch(() => undefined);
      }
    }
  } catch {
    // Ignorar si aún no existe el directorio
  }

  const versionStamp = Date.now();
  const fileName = `${slot}-${versionStamp}.${format.ext}`;
  const filePath = path.join(LOCAL_UPLOADS_DIR, fileName);
  await fs.writeFile(filePath, bytes);

  const currentMap = await getSiteImages();
  const updatedMeta: ImageSlotMetadata = {
    ...baseMeta,
    src: `/images/uploads/${fileName}`,
    alt: finalAlt,
    label: finalLabel,
    updatedAt: new Date(versionStamp).toISOString(),
    storageProvider: "local",
  };

  currentMap[slot] = updatedMeta;
  await writeLocalManifest(currentMap);
  invalidateSiteImagesMemoryCache();

  return updatedMeta;
}

/**
 * Restaura un slot a su imagen original por defecto.
 */
export async function resetSlotImageToDefault(
  slot: ImageSlotId
): Promise<ImageSlotMetadata> {
  const baseMeta = { ...IMAGE_SLOTS_REGISTRY[slot] };
  const cloudinaryCfg = getCloudinaryConfig();

  if (cloudinaryCfg) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const publicId = `odontoclinic/${slot}`;
    const paramsToSign = {
      invalidate: "true",
      public_id: publicId,
      timestamp,
    };
    const signature = signCloudinaryParams(
      paramsToSign,
      cloudinaryCfg.apiSecret
    );

    const form = new FormData();
    form.set("public_id", publicId);
    form.set("api_key", cloudinaryCfg.apiKey);
    form.set("timestamp", timestamp);
    form.set("invalidate", "true");
    form.set("signature", signature);

    await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        cloudinaryCfg.cloudName
      )}/image/destroy`,
      {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(10000),
      }
    ).catch(() => undefined);

    invalidateSiteImagesMemoryCache();
    return baseMeta;
  }

  // Modo Local: limpiar archivo subido del slot y restaurar en manifiesto
  try {
    const existingFiles = await fs.readdir(LOCAL_UPLOADS_DIR);
    for (const file of existingFiles) {
      if (file.startsWith(`${slot}-`)) {
        await fs
          .unlink(path.join(LOCAL_UPLOADS_DIR, file))
          .catch(() => undefined);
      }
    }
  } catch {
    // Ignorar si no existe el directorio
  }

  const currentMap = await getSiteImages();
  currentMap[slot] = baseMeta;
  await writeLocalManifest(currentMap).catch(() => undefined);
  invalidateSiteImagesMemoryCache();

  return baseMeta;
}
