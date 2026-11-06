"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, Check, ChevronDown } from "lucide-react";
import {
  CLINIC_SERVICES,
  SCHEDULE_PREFERENCES,
} from "@/config/site-config";
import {
  sanitizeAppointmentPhone,
  submitAppointmentRequest,
} from "@/lib/services/appointment-service";
import { AppointmentMode } from "@/types/domain";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  bookingMode?: AppointmentMode;
}

const SERVICES_OPTIONS = CLINIC_SERVICES.filter((s) => s.enabled).map(
  (s) => s.title
);

export function AppointmentModal({
  isOpen,
  onClose,
  initialService,
  bookingMode = "whatsapp",
}: AppointmentModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState(
    SERVICES_OPTIONS[0] || "Limpieza profunda"
  );
  const [preferredTime, setPreferredTime] = useState(
    SCHEDULE_PREFERENCES[0] || "Mañana (9:00 - 13:00)"
  );
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Campo trampa anti-bots
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Control anti-repetición (Rate Limit en cliente: mínimo 5 segundos entre envíos)
  const lastSubmitRef = useRef<number>(0);

  // Safe close handler that guarantees state cleanup
  const handleClose = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsSuccess(false);
      setShowNotes(false);
      setErrorMsg(null);
      onClose();
    },
    [onClose]
  );

  // Manage enter and exit animations with mount/unmount cycle
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 260);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Sync specialty when initialService or modal open state changes (Validado contra lista blanca)
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMsg(null);
      if (
        typeof initialService === "string" &&
        SERVICES_OPTIONS.includes(initialService.trim())
      ) {
        setSpecialty(initialService.trim());
      } else {
        setSpecialty(SERVICES_OPTIONS[0] || "Limpieza dental");
      }
    }
  }, [initialService, isOpen]);

  // Handle Escape key and body scroll lock
  useEffect(() => {
    if (!shouldRender) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldRender, handleClose]);

  if (!shouldRender) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Protección contra ataques de repetición / spam de clics (Cooldown de 5s)
    const now = Date.now();
    if (now - lastSubmitRef.current < 5000) {
      setErrorMsg(
        "Por favor espera unos segundos antes de enviar otra solicitud."
      );
      return;
    }

    // 2. Delegar validación, sanitización y envío al servicio modular de citas
    const result = await submitAppointmentRequest(
      {
        name: fullName,
        phone,
        specialty,
        preferredTime,
        notes: showNotes ? notes : "",
        honeypot,
      },
      bookingMode
    );

    if (!result.ok) {
      setErrorMsg(result.error || "Por favor verifica tus datos.");
      return;
    }

    lastSubmitRef.current = now;

    if (result.redirectUrl) {
      // Prevención de Reverse Tabnabbing con noopener,noreferrer
      window.open(result.redirectUrl, "_blank", "noopener,noreferrer");
    }

    setIsSuccess(true);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 transition-all duration-260 ease-out ${
        isVisible ? "opacity-100 backdrop-blur-sm" : "opacity-0 backdrop-blur-none pointer-events-none"
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full max-w-md bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-260 ease-out transform ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Compact & Clean */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 relative bg-[#ebf4f7] rounded-t-[28px] sm:rounded-t-[32px] border-b border-slate-200/50">
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-xs hover:shadow cursor-pointer active:scale-95"
            aria-label="Cerrar formulario"
          >
            <X className="w-4 h-4 stroke-[2.4]" />
          </button>

          {/* Clinic Brand Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 shadow-2xs border border-slate-200/60 mb-2">
            <Image
              src="/images/logo-navbar.png"
              alt="Odontoclinic"
              width={16}
              height={16}
              className="w-3.5 h-3.5 object-contain"
              unoptimized
            />
            <span className="text-[11px] font-semibold text-[#0f2236]">Odontoclinic • Camiri</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pr-10">
            Agendar una cita
          </h3>
          <p className="text-slate-600 text-xs sm:text-xs mt-1 leading-relaxed pr-8">
            Coordinaremos tu día y horario directamente por WhatsApp.
          </p>
        </div>

        {/* Modal Body - Frictionless Single-Screen */}
        <div className="px-5 sm:px-7 py-4 sm:py-5">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#ebf4f7] text-[#009bb3] flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">¡Solicitud iniciada!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Se abrió WhatsApp con tu solicitud. Te responderemos en minutos para confirmar tu horario.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-[#0f2236] hover:bg-[#18314a] text-white rounded-full font-medium text-xs transition-all shadow-sm cursor-pointer"
                >
                  Cerrar ventana
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {/* Campo Honeypot invisible contra bots de spam */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Tratamiento o Servicio con Dropdown Elegante */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tratamiento de interés
                </label>
                <div className="relative">
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all cursor-pointer pr-9"
                  >
                    {SERVICES_OPTIONS.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                  </div>
                </div>
              </div>

              {/* Datos personales: Nombre y Teléfono en Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Carmen Rodríguez"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={20}
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(sanitizeAppointmentPhone(e.target.value))}
                    placeholder="Ej. 78900000"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Preferencia de Horario (3 Chips Compactos) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Horario preferido
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {SCHEDULE_PREFERENCES.map((time) => {
                    const isSelected = preferredTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setPreferredTime(time)}
                        className={`px-2 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer text-center truncate ${
                          isSelected
                            ? "bg-[#009bb3] text-white shadow-2xs font-semibold"
                            : "bg-[#f2f8fa] text-slate-600 hover:bg-[#e2eff3]"
                        }`}
                        title={time}
                      >
                        {time.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mensaje opcional colapsable con animación fluida */}
              <div className="pt-0.5">
                {/* Botón para mostrar (cuando está cerrado) */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-250 ease-in-out ${
                    !showNotes ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowNotes(true)}
                      className="text-[11px] text-[#007485] hover:text-[#009bb3] font-medium flex items-center gap-1.5 transition-colors cursor-pointer py-0.5"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#ebf4f7] text-[#007485] flex items-center justify-center text-[10px] font-bold leading-none">
                        +
                      </span>
                      <span>Agregar nota o molestia específica (opcional)</span>
                    </button>
                  </div>
                </div>

                {/* Contenedor expandible para la nota (cuando se abre) */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    showNotes ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-1.5 pt-0.5 pb-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Nota o consulta específica
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotes(false);
                            setNotes("");
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-600 active:text-slate-800 transition-colors cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-slate-100"
                        >
                          ✕ Ocultar
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={280}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ej. Me molesta una muela al comer..."
                        className="w-full px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje de validación / error si aplica */}
              {errorMsg && (
                <p className="text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200/70 rounded-xl px-3 py-1.5">
                  {errorMsg}
                </p>
              )}

              {/* Action Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#009bb3] hover:bg-[#008398] active:bg-[#007485] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#009bb3]/20 hover:shadow-lg transition-all duration-200 cursor-pointer group active:scale-[0.99]"
                >
                  <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 2C6.516 2 2.023 6.49 2.023 12.003c0 1.83.493 3.555 1.353 5.048L2 22l5.093-1.336a9.94 9.94 0 0 0 4.938 1.341c5.513 0 10.007-4.49 10.007-10.002C22.038 6.49 17.545 2 12.031 2zm0 18.258a8.21 8.21 0 0 1-4.186-1.144l-.3-.178-3.111.816.83-3.033-.195-.311a8.204 8.204 0 0 1-1.258-4.406c0-4.55 3.702-8.25 8.22-8.25 4.518 0 8.22 3.7 8.22 8.25 0 4.551-3.702 8.256-8.22 8.256zm4.507-6.177c-.247-.123-1.463-.722-1.69-.804-.227-.083-.393-.123-.559.123-.166.247-.64 0.804-.784.968-.144.164-.288.185-.535.062-.247-.123-1.042-.384-1.986-1.226-.734-.655-1.23-1.464-1.374-1.711-.144-.247-.015-.38.109-.502.111-.11.247-.288.371-.432.124-.144.165-.247.248-.411.082-.165.041-.309-.021-.432-.062-.124-.559-1.348-.766-1.848-.201-.486-.406-.42-.559-.428h-.476c-.165 0-.434.062-.661.309-.227.247-.868.849-.868 2.07 0 1.222.889 2.404 1.013 2.569.124.165 1.75 2.673 4.238 3.748.592.256 1.054.409 1.414.523.595.19 1.137.163 1.564.099.477-.071 1.463-.598 1.669-1.175.206-.577.206-1.072.145-1.175-.062-.103-.227-.165-.474-.288z" />
                  </svg>
                  <span>Solicitar cita por WhatsApp</span>
                  <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Atención directa con el consultorio de la Dra. Pamela Claros • Camiri
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
