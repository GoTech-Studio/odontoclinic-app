"use client";

import { useEffect, useState } from "react";
import { IMAGE_SLOTS_REGISTRY } from "@/config/site-config";
import { SiteImagesMap } from "@/types/domain";

let sharedImagesPromise: Promise<SiteImagesMap | null> | null = null;
let sharedImagesSnapshot: SiteImagesMap | null = null;

function fetchSiteImagesOnce(): Promise<SiteImagesMap | null> {
  if (sharedImagesSnapshot) {
    return Promise.resolve(sharedImagesSnapshot);
  }
  if (!sharedImagesPromise) {
    sharedImagesPromise = fetch("/api/admin/images")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; slots?: SiteImagesMap } | null) => {
        if (data && data.ok && data.slots) {
          sharedImagesSnapshot = data.slots;
          return data.slots;
        }
        return null;
      })
      .catch(() => null);
  }
  return sharedImagesPromise;
}

/**
 * Hook reactivo compartido que entrega inmediatamente las imágenes por defecto
 * en el primer renderizado (cero parpadeo / cero impacto en LCP) y sincroniza
 * cualquier imagen actualizada vía POST /api/admin/images.
 */
export function useSiteImages(): SiteImagesMap {
  const [images, setImages] = useState<SiteImagesMap>(
    () => sharedImagesSnapshot || IMAGE_SLOTS_REGISTRY
  );

  useEffect(() => {
    let isMounted = true;
    fetchSiteImagesOnce().then((slots) => {
      if (isMounted && slots) {
        setImages(slots);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return images;
}
