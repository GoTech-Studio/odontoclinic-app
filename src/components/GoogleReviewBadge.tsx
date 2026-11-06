"use client";

import React, { useEffect, useState } from "react";
import { GoogleReviewsResponse } from "@/app/api/google-reviews/route";

interface GoogleReviewBadgeProps {
  variant?: "card" | "pill";
  className?: string;
  mapsUrl?: string;
}

const DEFAULT_REVIEW: GoogleReviewsResponse = {
  rating: 5.0,
  total_reviews: 2,
  featured_review: {
    author_name: "Christopher R. Mattix",
    author_url: "https://www.google.com/maps/contrib/114523587285738258707",
    profile_photo_url:
      "https://lh3.googleusercontent.com/a-/ALV-UjUJ0xzrNdK7tefsk3qVfrTYgeNSCHG2oJWCs7mWt0XMQex2GPuw=s120-c-rp-mo-ba12-br100",
    rating: 5,
    relative_time_description: "Local Guide · Google Maps",
    text: "Recomendado. El mejor lugar en Camiri. Profesional y siempre a la hora.",
    googleMapsUri: "https://maps.app.goo.gl/HnyTUzgeKH5B42jM8",
  },
  reviews: [
    {
      author_name: "Christopher R. Mattix",
      author_url: "https://www.google.com/maps/contrib/114523587285738258707",
      profile_photo_url:
        "https://lh3.googleusercontent.com/a-/ALV-UjUJ0xzrNdK7tefsk3qVfrTYgeNSCHG2oJWCs7mWt0XMQex2GPuw=s120-c-rp-mo-ba12-br100",
      rating: 5,
      relative_time_description: "Local Guide · Google Maps",
      text: "Recomendado. El mejor lugar en Camiri. Profesional y siempre a la hora.",
      googleMapsUri: "https://maps.app.goo.gl/HnyTUzgeKH5B42jM8",
    },
    {
      author_name: "Josué",
      author_url: "https://maps.app.goo.gl/rhr5QngmSn4xwNe97",
      profile_photo_url:
        "https://lh3.googleusercontent.com/a-/ALV-UjVs166wJ6ygYPsIGMiZOHS8RZ6a_8C_eAso5bgoK0eygH1IZhys=w72-h72-p-rp-mo-ba12-br100",
      rating: 5,
      relative_time_description: "Local Guide · 14 reseñas · 53 fotos",
      text: "Muy contento con mi tratamiento de ortodoncia. Atención cercana y excelentes resultados.",
      googleMapsUri: "https://maps.app.goo.gl/rhr5QngmSn4xwNe97",
    },
  ],
  google_maps_url: "https://maps.app.goo.gl/HnyTUzgeKH5B42jM8",
  is_live: true,
};

function getSafeExternalUrl(rawUrl: string | undefined, fallback: string): string {
  if (!rawUrl) return fallback;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // URL inválida
  }
  return fallback;
}

export function GoogleReviewBadge({
  variant = "card",
  className = "",
  mapsUrl,
}: GoogleReviewBadgeProps) {
  const [data] = useState<GoogleReviewsResponse>(DEFAULT_REVIEW);
  const [avatarError, setAvatarError] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    if (variant !== "card" || (data.reviews?.length ?? 0) < 2) return;

    const timer = window.setInterval(() => {
      setActiveReviewIndex((current) => current + 1);
      setAvatarError(false);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [variant, data.reviews?.length]);

  const { featured_review, google_maps_url, rating } = data;
  const reviews = data.reviews?.length ? data.reviews : [featured_review];
  const activeReview = reviews[activeReviewIndex % reviews.length];
  const safeMapsUrl = getSafeExternalUrl(
    mapsUrl || activeReview.googleMapsUri || google_maps_url,
    DEFAULT_REVIEW.google_maps_url
  );
  const safeAvatarUrl = getSafeExternalUrl(
    activeReview.profile_photo_url,
    ""
  );
  const safeRating =
    typeof rating === "number" && Number.isFinite(rating)
      ? Math.min(Math.max(rating, 0), 5)
      : 5.0;

  // Renderizado variante "pill" (Píldora compacta y elegante para móvil)
  if (variant === "pill") {
    return (
      <a
        href={safeMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-sm border border-slate-200/80 hover:border-[#009bb3]/50 hover:shadow-md transition-all duration-200 active:scale-95 ${className}`}
      >
        {/* Official Google G Logo SVG */}
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>

        {/* 5 Stars */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.round(safeRating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200"
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Rating text */}
        <span className="text-xs font-bold text-slate-800">
          {safeRating.toFixed(1)}
        </span>

      </a>
    );
  }

  // Renderizado variante "card" (Tarjeta completa para desktop o sección de testimonios)
  return (
    <a
      key={activeReviewIndex % reviews.length}
      href={safeMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block ${reviews.length > 1 ? "animate-review-fade" : ""} bg-white/95 backdrop-blur-md p-3.5 sm:p-4 lg:p-5 rounded-2xl shadow-xl shadow-slate-900/10 border border-white/90 hover:border-[#009bb3]/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl text-left pointer-events-auto max-w-[320px] sm:max-w-[340px] lg:max-w-[390px] xl:max-w-[420px] ${className}`}
    >
      {/* Header: Google Icon + Rating Stars + Google Label */}
      <div className="flex items-center justify-between gap-2 mb-2 lg:mb-3">
        <div className="flex items-center gap-2">
          {/* Official Google G Logo SVG */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="text-[11px] font-semibold text-slate-800 tracking-tight">
            Google Maps
          </span>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
            Verificada
          </span>
        </div>

        {/* 5 Stars */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.round(safeRating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200"
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-[11px] font-bold text-slate-700 ml-1">
            {safeRating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Real Patient Comment Text */}
      <p className="text-xs text-slate-700 leading-snug italic line-clamp-3 mb-2.5 lg:mb-4">
        &ldquo;{activeReview.text}&rdquo;
      </p>

      {/* Footer: Author Name & Verified Badge */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 lg:pt-2 border-t border-slate-100">
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          {safeAvatarUrl && !avatarError ? (
            <img
              src={safeAvatarUrl}
              alt={activeReview.author_name}
              referrerPolicy="no-referrer"
              className="w-4 h-4 rounded-full object-cover shrink-0"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="w-4 h-4 rounded-full bg-[#009bb3]/15 text-[#007485] flex items-center justify-center font-bold text-[9px] shrink-0">
              {(activeReview.author_name || "P").charAt(0)}
            </span>
          )}
          <span className="truncate max-w-[130px]">{activeReview.author_name}</span>
          <span className="text-[9px] text-amber-600 font-medium">
            ★ {activeReview.relative_time_description}
          </span>
        </span>

        <span className="text-[#007485] font-medium group-hover:underline flex items-center gap-1 shrink-0">
          Ver reseña ↗
        </span>
      </div>
    </a>
  );
}
