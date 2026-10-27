import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/auth/auth-guard";
import {
  buildWhatsAppBookingUrl,
  validateAndSanitizeAppointment,
} from "@/lib/services/appointment-service";
import { AppointmentPayload } from "@/types/domain";

const BOOKING_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const BOOKING_MAX_REQ_PER_WINDOW = 8;
const bookingRateMap = new Map<string, { count: number; resetAt: number }>();

function isBookingRateLimited(ip: string): boolean {
  const now = Date.now();
  if (bookingRateMap.size > 1000) {
    for (const [k, v] of bookingRateMap.entries()) {
      if (now > v.resetAt) bookingRateMap.delete(k);
    }
  }
  const bucket = bookingRateMap.get(ip);
  if (!bucket || now > bucket.resetAt) {
    bookingRateMap.set(ip, {
      count: 1,
      resetAt: now + BOOKING_RATE_WINDOW_MS,
    });
    return false;
  }
  bucket.count += 1;
  return bucket.count > BOOKING_MAX_REQ_PER_WINDOW;
}

/**
 * POST /api/appointments
 * Endpoint modular preparado para cuando el sistema escale a reservas online
 * con base de datos (Supabase / PostgreSQL) y panel administrativo de citas.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isBookingRateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Has realizado demasiadas solicitudes de cita en poco tiempo. Por favor intenta más tarde.",
      },
      { status: 429, headers: { "Retry-After": "600" } }
    );
  }

  let body: AppointmentPayload;
  try {
    body = (await request.json()) as AppointmentPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Cuerpo JSON inválido." },
      { status: 400 }
    );
  }

  const validation = validateAndSanitizeAppointment(body);
  if (!validation.valid || !validation.sanitized) {
    if (validation.error === "HONEYPOT_TRIGGERED") {
      return NextResponse.json({
        ok: true,
        appointmentId: `apt_${crypto.randomUUID().slice(0, 8)}`,
      });
    }
    return NextResponse.json(
      { ok: false, error: validation.error },
      { status: 400 }
    );
  }

  const appointmentId = `apt_${crypto.randomUUID().slice(0, 8)}`;
  const whatsappFallbackUrl = buildWhatsAppBookingUrl(validation.sanitized);

  // Punto de extensión listo para persistir en Base de Datos (ej. prisma.appointment.create / supabase.from('appointments').insert)
  return NextResponse.json({
    ok: true,
    appointmentId,
    status: "pending_confirmation",
    createdAt: new Date().toISOString(),
    appointment: validation.sanitized,
    whatsappFallbackUrl,
  });
}
