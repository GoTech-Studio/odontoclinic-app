import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isValidImageSlot, VALID_IMAGE_SLOTS } from "@/config/site-config";
import { getClientIp, verifyAdminRequest } from "@/lib/auth/auth-guard";
import {
  detectImageFormatFromBytes,
  getSiteImages,
  MAX_IMAGE_BYTES,
  MIN_IMAGE_BYTES,
  resetSlotImageToDefault,
  updateSlotImage,
} from "@/lib/services/site-images";

const READ_WINDOW_MS = 60 * 1000;
const READ_MAX_REQ = 60;
const readRateMap = new Map<string, { count: number; resetAt: number }>();

function isReadRateLimited(ip: string): boolean {
  const now = Date.now();
  if (readRateMap.size > 500) {
    for (const [k, v] of readRateMap.entries()) {
      if (now > v.resetAt) readRateMap.delete(k);
    }
  }
  const entry = readRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    readRateMap.set(ip, { count: 1, resetAt: now + READ_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > READ_MAX_REQ;
}

/**
 * GET /api/admin/images
 * Devuelve el mapa actual de todos los slots de imágenes registrados.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (isReadRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas peticiones. Intenta en un minuto." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const slots = await getSiteImages();
  return NextResponse.json(
    {
      ok: true,
      available_slots: VALID_IMAGE_SLOTS,
      slots,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

/**
 * POST /api/admin/images
 * Reemplaza la imagen de un slot autorizado sin tocar código ni requerir panel.
 * Body: multipart/form-data con campos:
 *  - slot: "hero" | "doctor" | "clinic_1" | "clinic_2" | "clinic_3"
 *  - file: Archivo binario (JPEG, PNG o WebP hasta 8 MB)
 *  - label (opcional): Etiqueta visible en la foto
 *  - alt (opcional): Texto alternativo SEO/Accesibilidad
 */
export async function POST(request: NextRequest) {
  const auth = verifyAdminRequest(request, "doctor");
  if (!auth.allowed) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Formato inválido. Debes enviar multipart/form-data con los campos 'slot' y 'file'.",
      },
      { status: 400 }
    );
  }

  const rawSlot = formData.get("slot");
  if (!isValidImageSlot(rawSlot)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Slot inválido. Los slots permitidos son: ${VALID_IMAGE_SLOTS.join(
          ", "
        )}.`,
      },
      { status: 400 }
    );
  }

  const rawFile = formData.get("file");
  if (!rawFile || typeof rawFile === "string" || !("arrayBuffer" in rawFile)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Debes adjuntar un archivo de imagen en el campo 'file'.",
      },
      { status: 400 }
    );
  }

  if (rawFile.size < MIN_IMAGE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "El archivo de imagen está vacío o corrupto." },
      { status: 400 }
    );
  }

  if (rawFile.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: "La imagen supera el límite máximo permitido de 8 MB.",
      },
      { status: 413 }
    );
  }

  const bytes = new Uint8Array(await rawFile.arrayBuffer());
  const detectedFormat = detectImageFormatFromBytes(bytes);

  if (!detectedFormat) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Formato binario no permitido. Solo se aceptan imágenes reales JPEG, PNG o WebP (verificadas por Magic Bytes).",
      },
      { status: 400 }
    );
  }

  const customAlt = formData.get("alt");
  const customLabel = formData.get("label");

  try {
    const updatedSlot = await updateSlotImage({
      slot: rawSlot,
      bytes,
      format: detectedFormat,
      alt: typeof customAlt === "string" ? customAlt : undefined,
      label: typeof customLabel === "string" ? customLabel : undefined,
    });

    revalidatePath("/");

    return NextResponse.json({
      ok: true,
      message: `Imagen del slot '${rawSlot}' actualizada exitosamente.`,
      slot: updatedSlot,
    });
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "Error interno al almacenar la imagen.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/images?slot=clinic_1
 * Restaura un slot específico a su imagen original por defecto.
 */
export async function DELETE(request: NextRequest) {
  const auth = verifyAdminRequest(request, "doctor");
  if (!auth.allowed) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  let slotCandidate: unknown = request.nextUrl.searchParams.get("slot");

  if (!slotCandidate) {
    const contentType = request.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json")) {
        const body = (await request.json()) as { slot?: unknown };
        slotCandidate = body.slot;
      } else if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        slotCandidate = formData.get("slot");
      }
    } catch {
      // Ignorar si no hay body válido
    }
  }

  if (!isValidImageSlot(slotCandidate)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Debes indicar un slot válido (${VALID_IMAGE_SLOTS.join(
          ", "
        )}) por query (?slot=clinic_1) o body JSON.`,
      },
      { status: 400 }
    );
  }

  try {
    const restoredSlot = await resetSlotImageToDefault(slotCandidate);
    revalidatePath("/");

    return NextResponse.json({
      ok: true,
      message: `El slot '${slotCandidate}' fue restaurado a su imagen original.`,
      slot: restoredSlot,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error al restaurar el slot de imagen." },
      { status: 500 }
    );
  }
}
