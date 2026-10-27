import { NextRequest, NextResponse } from "next/server";

export interface GoogleReviewItem {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

export interface GoogleReviewsResponse {
  rating: number;
  total_reviews: number;
  featured_review: GoogleReviewItem;
  google_maps_url: string;
  is_live: boolean;
}

// Reseña oficial real obtenida directamente de Google Maps para Odontoclinic Camiri
const FALLBACK_DATA: GoogleReviewsResponse = {
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
  },
  google_maps_url: "https://maps.app.goo.gl/C6zx2rfVefDevf3Z9",
  is_live: false,
};

// Rate Limiting en memoria por IP (Defensa contra abuso de endpoint / DDoS de capa 7)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 30;
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  // Limpieza preventiva para evitar crecimiento de memoria
  if (ipRequestCounts.size > 1000) {
    for (const [key, val] of ipRequestCounts.entries()) {
      if (now > val.resetAt) ipRequestCounts.delete(key);
    }
  }

  const record = ipRequestCounts.get(ip);
  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count += 1;
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

function sanitizeHttpsUrl(url: unknown, fallback: string): string {
  if (typeof url === "string" && url.startsWith("https://")) {
    return url;
  }
  return fallback;
}

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
};

export async function GET(request: NextRequest) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(clientIp)) {
    return NextResponse.json(FALLBACK_DATA, {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || "ChIJQXSyuItL9pMRbz5Nr9dFdK0";

  // Si no hay credenciales configuradas en .env.local, devolver datos de respaldo con formato Google
  if (!apiKey || !placeId) {
    return NextResponse.json(FALLBACK_DATA, { headers: CACHE_HEADERS });
  }

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      fields: "name,rating,user_ratings_total,reviews,url",
      language: "es",
      key: apiKey,
    });

    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;

    const res = await fetch(url, {
      next: { revalidate: 86400 }, // Caché de 24 horas para no agotar la cuota de Google
      signal: AbortSignal.timeout(5000), // Timeout estricto de 5s contra bloqueos upstream
    });

    if (!res.ok) {
      return NextResponse.json(FALLBACK_DATA, { headers: CACHE_HEADERS });
    }

    const data = await res.json();
    const result = data.result;

    if (!result || !Array.isArray(result.reviews) || result.reviews.length === 0) {
      return NextResponse.json(FALLBACK_DATA, { headers: CACHE_HEADERS });
    }

    // Filtrar reseñas con texto y 5 o 4 estrellas
    const positiveReviews = result.reviews.filter(
      (r: GoogleReviewItem) => typeof r.text === "string" && r.text.length > 0 && r.rating >= 4
    );
    const featured = positiveReviews[0] || result.reviews[0];

    return NextResponse.json(
      {
        rating: typeof result.rating === "number" ? Math.min(Math.max(result.rating, 1), 5) : 5.0,
        total_reviews: typeof result.user_ratings_total === "number" ? result.user_ratings_total : 20,
        featured_review: {
          author_name: String(featured.author_name || "Paciente Verificado").slice(0, 80),
          author_url: sanitizeHttpsUrl(featured.author_url, FALLBACK_DATA.google_maps_url),
          profile_photo_url: sanitizeHttpsUrl(featured.profile_photo_url, ""),
          rating: typeof featured.rating === "number" ? featured.rating : 5,
          relative_time_description: String(featured.relative_time_description || "Google Maps").slice(0, 60),
          text: String(featured.text || "").slice(0, 400),
        },
        google_maps_url: sanitizeHttpsUrl(result.url, "https://maps.app.goo.gl/woSVLJSsF8kS31Za7"),
        is_live: true,
      },
      { headers: CACHE_HEADERS }
    );
  } catch {
    // No exponer trazas ni detalles internos en logs de producción que puedan filtrar la API Key en la URL
    console.error("Error consultando Google Places API (solicitud abortada o fallida).");
    return NextResponse.json(FALLBACK_DATA, { headers: CACHE_HEADERS });
  }
}
