import {
  getAllowedServiceNames,
  SCHEDULE_PREFERENCES,
  WHATSAPP_CLINIC_NUMBER,
} from "@/config/site-config";
import {
  AppointmentMode,
  AppointmentPayload,
  AppointmentSubmissionResult,
} from "@/types/domain";

/**
 * Sanitiza entradas de texto eliminando saltos de línea, tabulaciones y etiquetas HTML
 * para impedir inyección de formato en mensajes o registros.
 */
export function sanitizeAppointmentText(
  input: unknown,
  maxLength: number
): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\r\n\t<>]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * Permite únicamente dígitos, espacios y símbolos telefónicos estándar (+, -, paréntesis).
 */
export function sanitizeAppointmentPhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/[^\d+\s()-]/g, "").slice(0, 20);
}

export interface ValidatedAppointmentData {
  valid: boolean;
  error?: string;
  sanitized?: {
    name: string;
    phone: string;
    specialty: string;
    preferredTime: string;
    notes: string;
    preferredDate?: string;
  };
}

export function validateAndSanitizeAppointment(
  payload: AppointmentPayload
): ValidatedAppointmentData {
  // 1. Verificación Honeypot anti-bots
  if (payload.honeypot && payload.honeypot.trim() !== "") {
    return { valid: false, error: "HONEYPOT_TRIGGERED" };
  }

  const allowedServices = getAllowedServiceNames();
  const safeName = sanitizeAppointmentText(payload.name, 80);
  const safePhone = sanitizeAppointmentPhone(payload.phone).trim();
  const digitCount = safePhone.replace(/\D/g, "").length;
  const safeNotes = sanitizeAppointmentText(payload.notes || "", 280);
  const safeSpecialty = allowedServices.includes(payload.specialty)
    ? payload.specialty
    : allowedServices[0] || "Valoración general / Otro";
  const safeTime = SCHEDULE_PREFERENCES.includes(payload.preferredTime)
    ? payload.preferredTime
    : SCHEDULE_PREFERENCES[0];

  if (safeName.length < 2) {
    return {
      valid: false,
      error: "Por favor ingresa tu nombre completo (mínimo 2 caracteres).",
    };
  }

  if (digitCount < 7 || digitCount > 15) {
    return {
      valid: false,
      error: "Por favor ingresa un número de teléfono válido (7 a 15 dígitos).",
    };
  }

  return {
    valid: true,
    sanitized: {
      name: safeName,
      phone: safePhone,
      specialty: safeSpecialty,
      preferredTime: safeTime,
      notes: safeNotes,
      preferredDate: payload.preferredDate
        ? sanitizeAppointmentText(payload.preferredDate, 30)
        : undefined,
    },
  };
}

export function buildWhatsAppBookingUrl(
  sanitized: NonNullable<ValidatedAppointmentData["sanitized"]>
): string {
  const lines = [
    "Hola *Odontoclinic*, me gustaría agendar una cita con la *Dra. Pamela Claros*:",
    "",
    `• *Paciente:* ${sanitized.name}`,
    `• *Teléfono:* ${sanitized.phone}`,
    `• *Motivo / Tratamiento:* ${sanitized.specialty}`,
    `• *Turno de preferencia:* ${sanitized.preferredTime}`,
  ];

  if (sanitized.preferredDate) {
    lines.push(`• *Fecha deseada:* ${sanitized.preferredDate}`);
  }

  if (sanitized.notes) {
    lines.push(`• *Notas adicionales:* ${sanitized.notes}`);
  }

  lines.push("", "¡Quedo atento(a) a su confirmación, muchas gracias!");

  return `https://wa.me/${WHATSAPP_CLINIC_NUMBER}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}

/**
 * Adaptador desacoplado de envío de citas:
 * - Por defecto usa modo "whatsapp".
 * - Si se pasa mode="online_api" (para escalar a sistema de reservas online con Base de Datos),
 *   envía la solicitud a POST /api/appointments.
 */
export async function submitAppointmentRequest(
  payload: AppointmentPayload,
  mode: AppointmentMode = "whatsapp"
): Promise<AppointmentSubmissionResult> {
  const validation = validateAndSanitizeAppointment(payload);

  if (!validation.valid || !validation.sanitized) {
    if (validation.error === "HONEYPOT_TRIGGERED") {
      return { ok: true, mode };
    }
    return {
      ok: false,
      mode,
      error: validation.error || "Datos de cita inválidos.",
    };
  }

  if (mode === "whatsapp") {
    const redirectUrl = buildWhatsAppBookingUrl(validation.sanitized);
    return {
      ok: true,
      mode: "whatsapp",
      redirectUrl,
    };
  }

  // Modo Online API (Preparado para Base de Datos / Calendario Online)
  try {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as {
      ok: boolean;
      appointmentId?: string;
      whatsappFallbackUrl?: string;
      error?: string;
    };

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        mode: "online_api",
        error: data.error || "No se pudo registrar la cita online.",
      };
    }

    return {
      ok: true,
      mode: "online_api",
      appointmentId: data.appointmentId,
      redirectUrl: data.whatsappFallbackUrl,
    };
  } catch {
    return {
      ok: false,
      mode: "online_api",
      error: "Error de conexión al procesar la solicitud.",
    };
  }
}
