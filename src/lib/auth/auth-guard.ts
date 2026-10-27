import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { AdminPrincipal, AdminRole } from "@/types/domain";

const FAILED_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_FAILED_ATTEMPTS = 5;

interface FailedAttemptBucket {
  failures: number;
  resetAt: number;
}

const failedAttemptsStore = new Map<string, FailedAttemptBucket>();

const ROLE_WEIGHT: Record<AdminRole, number> = {
  staff: 1,
  doctor: 2,
  owner: 3,
};

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "local";
}

function isIpBlockedByBruteForce(ip: string): boolean {
  const now = Date.now();
  const bucket = failedAttemptsStore.get(ip);
  if (!bucket) return false;
  if (now > bucket.resetAt) {
    failedAttemptsStore.delete(ip);
    return false;
  }
  return bucket.failures >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  if (failedAttemptsStore.size > 1000) {
    for (const [key, val] of failedAttemptsStore.entries()) {
      if (now > val.resetAt) failedAttemptsStore.delete(key);
    }
  }
  const bucket = failedAttemptsStore.get(ip);
  if (!bucket || now > bucket.resetAt) {
    failedAttemptsStore.set(ip, {
      failures: 1,
      resetAt: now + FAILED_WINDOW_MS,
    });
  } else {
    bucket.failures += 1;
  }
}

function clearFailedAttempts(ip: string): void {
  failedAttemptsStore.delete(ip);
}

/**
 * Comparación en tiempo constante inmune a Timing Attacks y a filtración de longitud.
 * Calcula el hash SHA-256 de ambas cadenas (siempre 32 bytes) y usa timingSafeEqual.
 */
function constantTimeCompare(candidate: string, secret: string): boolean {
  const candidateHash = crypto.createHash("sha256").update(candidate).digest();
  const secretHash = crypto.createHash("sha256").update(secret).digest();
  return crypto.timingSafeEqual(candidateHash, secretHash);
}

/**
 * Punto de extensión para futuras sesiones de panel (/admin/login).
 * Verifica una cookie firmada HMAC-SHA256 con formato: base64url(payload).base64url(signature)
 */
function verifyFutureSessionCookie(
  cookieValue: string,
  secret: string
): AdminPrincipal | null {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return null;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  if (!constantTimeCompare(signature, expectedSig)) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as { sub?: string; role?: AdminRole; exp?: number };

    if (!decoded.exp || Date.now() > decoded.exp) {
      return null;
    }

    const role: AdminRole =
      decoded.role === "owner" ||
      decoded.role === "doctor" ||
      decoded.role === "staff"
        ? decoded.role
        : "staff";

    return {
      authenticated: true,
      role,
      method: "session_cookie",
      subject: decoded.sub || "session-user",
    };
  } catch {
    return null;
  }
}

export interface AuthGuardResult {
  allowed: boolean;
  status: 200 | 401 | 403 | 429 | 503;
  error?: string;
  principal?: AdminPrincipal;
}

/**
 * Guardián unificado de autenticación administrativa:
 * - Hoy: valida `Authorization: Bearer <ADMIN_IMAGE_API_KEY>` o `x-admin-api-key`.
 * - Futuro: valida automáticamente cookies de sesión (`odontoclinic_session`) con control de roles.
 */
export function verifyAdminRequest(
  request: NextRequest,
  minimumRole: AdminRole = "doctor"
): AuthGuardResult {
  const ip = getClientIp(request);

  if (isIpBlockedByBruteForce(ip)) {
    return {
      allowed: false,
      status: 429,
      error:
        "Demasiados intentos de autenticación fallidos. Intenta nuevamente en 15 minutos.",
    };
  }

  const configuredKey = process.env.ADMIN_IMAGE_API_KEY?.trim();

  if (!configuredKey || configuredKey.length < 16) {
    return {
      allowed: false,
      status: 503,
      error:
        "La variable de entorno ADMIN_IMAGE_API_KEY no está configurada o tiene menos de 16 caracteres.",
    };
  }

  // 1. Extraer token desde Authorization: Bearer <token> o header x-admin-api-key
  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const apiKeyHeader = request.headers.get("x-admin-api-key")?.trim() || "";
  const candidateToken = bearerToken || apiKeyHeader;

  if (candidateToken) {
    if (constantTimeCompare(candidateToken, configuredKey)) {
      clearFailedAttempts(ip);
      return {
        allowed: true,
        status: 200,
        principal: {
          authenticated: true,
          role: "owner",
          method: "api_key",
          subject: "api-key-admin",
        },
      };
    }

    recordFailedAttempt(ip);
    return {
      allowed: false,
      status: 401,
      error: "Token de autorización inválido.",
    };
  }

  // 2. Estrategia de Sesión Cookie (Lista para cuando se agregue /admin/login)
  const sessionCookie = request.cookies.get("odontoclinic_session")?.value;
  if (sessionCookie) {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim() || configuredKey;
    const principal = verifyFutureSessionCookie(sessionCookie, sessionSecret);

    if (principal) {
      if (ROLE_WEIGHT[principal.role] < ROLE_WEIGHT[minimumRole]) {
        return {
          allowed: false,
          status: 403,
          error: "Tu rol no tiene permisos suficientes para esta operación.",
        };
      }
      clearFailedAttempts(ip);
      return {
        allowed: true,
        status: 200,
        principal,
      };
    }

    recordFailedAttempt(ip);
    return {
      allowed: false,
      status: 401,
      error: "Sesión expirada o inválida.",
    };
  }

  return {
    allowed: false,
    status: 401,
    error:
      "Se requiere autenticación (Header 'Authorization: Bearer <TOKEN>').",
  };
}
