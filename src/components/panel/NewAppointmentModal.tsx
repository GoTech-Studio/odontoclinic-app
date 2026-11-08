"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Clock,
  User,
  Phone,
  Check,
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  FileText,
} from "lucide-react";
import { sanitizeAppointmentPhone } from "@/lib/services/appointment-service";
import { CLINIC_SERVICES, EXTRA_BOOKING_OPTIONS } from "@/config/site-config";
import {
  buscarPacientesExistentes,
  verificarSolapamientoHorario,
  getCitasPorFecha,
} from "@/lib/services/citas-supabase";
import { Paciente, Cita } from "@/types/database.types";

const DURACION_SERVICIOS: Record<string, number> = {
  "Limpieza profunda": 45,
  "Restauraciones estéticas": 45,
  "Tratamiento de conducto": 60,
  "Prótesis fija y removible": 45,
  "Implantes dentales": 60,
  "Cirugías de alta complejidad": 60,
  "Valoración general / Otro": 30,
};

const PROCEDIMIENTOS_LANDING = [
  ...CLINIC_SERVICES.filter((s) => s.enabled).map((s) => ({
    nombre: s.title,
    duracion: DURACION_SERVICIOS[s.title] || 45,
  })),
  ...EXTRA_BOOKING_OPTIONS.map((title) => ({
    nombre: title,
    duracion: DURACION_SERVICIOS[title] || 30,
  })),
];

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // formato YYYY-MM-DD inicial
  onSaveAppointment: (appointmentData: {
    pacienteNombre: string;
    pacienteTelefono: string;
    procedimientoNombre: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    motivo: string;
  }) => void;
}

function esFechaDomingo(fechaStr: string): boolean {
  if (!fechaStr) return false;
  const [y, m, d] = fechaStr.split("-").map(Number);
  if (!y || !m || !d) return false;
  return new Date(y, m - 1, d).getDay() === 0;
}

function obtenerSiguienteLunes(fechaStr: string): string {
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const delta = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + delta);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

export function NewAppointmentModal({
  isOpen,
  onClose,
  selectedDate: initialDate,
  onSaveAppointment,
}: NewAppointmentModalProps) {
  const [fechaCita, setFechaCita] = useState(initialDate);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [sugerenciasPacientes, setSugerenciasPacientes] = useState<Paciente[]>([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState(false);

  const [procedimiento, setProcedimiento] = useState(PROCEDIMIENTOS_LANDING[0].nombre);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [motivo, setMotivo] = useState("");

  const [citasDelDia, setCitasDelDia] = useState<Cita[]>([]);
  const [conflictoHorario, setConflictoHorario] = useState<{ paciente: string; hora: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFechaCita(initialDate);
    }
  }, [isOpen, initialDate]);

  const recargarCitasFecha = useCallback(async (fecha: string) => {
    try {
      const citas = await getCitasPorFecha(fecha);
      setCitasDelDia(citas.filter((c) => c.estado !== "CANCELADA" && c.estado !== "NO_ASISTIO"));
    } catch {
      setCitasDelDia([]);
    }
  }, []);

  useEffect(() => {
    if (isOpen && fechaCita) {
      recargarCitasFecha(fechaCita);
    }
  }, [isOpen, fechaCita, recargarCitasFecha]);

  const handleNombreChange = async (val: string) => {
    setNombre(val);
    if (val.trim().length >= 2) {
      const resultados = await buscarPacientesExistentes(val);
      setSugerenciasPacientes(resultados);
      setMostrandoSugerencias(resultados.length > 0);
    } else {
      setSugerenciasPacientes([]);
      setMostrandoSugerencias(false);
    }
  };

  const seleccionarPacienteExistente = (p: Paciente) => {
    setNombre(`${p.nombres} ${p.apellidos || ""}`.trim());
    setTelefono(p.telefono);
    setMostrandoSugerencias(false);
  };

  const calcularHoraFin = (inicioStr: string, procNombre: string) => {
    const proc = PROCEDIMIENTOS_LANDING.find((p) => p.nombre === procNombre);
    const duracionMin = proc ? proc.duracion : 30;

    const [h, m] = inicioStr.split(":").map(Number);
    const totalMinutos = h * 60 + m + duracionMin;
    const endH = Math.floor(totalMinutos / 60) % 24;
    const endM = totalMinutos % 60;

    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  };

  const horaFinCalculada = calcularHoraFin(horaInicio, procedimiento);

  useEffect(() => {
    async function chequearSolapamiento() {
      if (!fechaCita || !horaInicio) return;
      const res = await verificarSolapamientoHorario(fechaCita, horaInicio, horaFinCalculada);
      if (!res.disponible && res.citaConflicto) {
        setConflictoHorario(res.citaConflicto);
      } else {
        setConflictoHorario(null);
      }
    }
    chequearSolapamiento();
  }, [fechaCita, horaInicio, horaFinCalculada]);

  const validarHorarioAtencion = (fechaStr: string, inicio: string) => {
    const [y, m, d] = fechaStr.split("-").map(Number);
    const fechaObj = new Date(y, m - 1, d);
    const diaSemana = fechaObj.getDay();
    const [h, min] = inicio.split(":").map(Number);
    const minutosInicio = h * 60 + min;

    if (diaSemana === 0) {
      return "La clínica no atiende los domingos. Por favor selecciona una fecha de lunes a sábado.";
    }

    if (minutosInicio < 9 * 60) {
      return "El horario de atención inicia a las 09:00 AM.";
    }

    if (diaSemana === 6 && minutosInicio >= 12 * 60) {
      return "Los sábados la clínica atiende únicamente hasta las 12:00 PM.";
    }

    if (diaSemana >= 1 && diaSemana <= 5 && minutosInicio >= 17 * 60) {
      return "De lunes a viernes la clínica atiende hasta las 17:00 (5:00 PM).";
    }

    return null;
  };

  const esDomingoSeleccionado = esFechaDomingo(fechaCita);

  const formatearFechaHeader = (fechaStr: string) => {
    try {
      const [y, m, d] = fechaStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const texto = date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    } catch {
      return fechaStr;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError("Por favor ingresa el nombre del paciente.");
      return;
    }
    const cleanPhone = sanitizeAppointmentPhone(telefono);
    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 7) {
      setError("Por favor ingresa un número de celular válido para recordatorios.");
      return;
    }

    const advertenciaHorario = validarHorarioAtencion(fechaCita, horaInicio);
    if (advertenciaHorario) {
      setError(advertenciaHorario);
      return;
    }

    if (conflictoHorario) {
      setError(
        `Horario ocupado: ${conflictoHorario.paciente} ya tiene cita a las ${conflictoHorario.hora}.`
      );
      return;
    }

    onSaveAppointment({
      pacienteNombre: nombre.trim(),
      pacienteTelefono: cleanPhone,
      procedimientoNombre: procedimiento,
      fecha: fechaCita,
      horaInicio,
      horaFin: horaFinCalculada,
      motivo: motivo.trim() || `Atención para ${procedimiento}`,
    });

    setNombre("");
    setTelefono("");
    setMotivo("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center sm:p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card: Bottom sheet en móviles (< sm), tarjeta centrada en desktop */}
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88dvh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Barra superior de arrastre visual para dispositivos móviles */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Cabecera Limpia y Minimalista */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              Agendar Cita
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {formatearFechaHeader(fechaCita)} • Atención 1 a 1
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Horarios ya ocupados en esta fecha (insignia discreta) */}
        {citasDelDia.length > 0 && (
          <div className="px-5 sm:px-6 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 text-[11px] text-slate-600 shrink-0 overflow-x-auto">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold text-slate-700 shrink-0">
              Ocupado ({citasDelDia.length}):
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {citasDelDia.map((c) => {
                const ini = new Date(c.fecha_hora_inicio).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
                return (
                  <span
                    key={c.id}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-700 font-bold text-[10px]"
                  >
                    {ini}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-5 sm:p-6 space-y-4 flex-1">
            {/* Mensajes de Error o Conflicto */}
            {esDomingoSeleccionado && (
              <div className="flex items-start justify-between gap-2.5 p-3 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p>Domingo sin atención</p>
                    <p className="text-[11px] font-normal text-rose-700 mt-0.5">
                      No es posible agendar citas los domingos. Selecciona un día de lunes a sábado.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFechaCita(obtenerSiguienteLunes(fechaCita));
                    setError(null);
                  }}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Pasar al lunes
                </button>
              </div>
            )}

            {error && !esDomingoSeleccionado && (
              <div className="flex items-start gap-2 p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {conflictoHorario && (
              <div className="flex items-start gap-2.5 p-3 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/80 rounded-2xl animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p>Horario ocupado</p>
                  <p className="text-[11px] font-normal text-amber-800 mt-0.5">
                    {conflictoHorario.paciente} ya tiene turno a las {conflictoHorario.hora}. Selecciona otro horario.
                  </p>
                </div>
              </div>
            )}

            {/* Datos del Paciente */}
            <div className="space-y-3">
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del paciente
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nombre y apellido..."
                    value={nombre}
                    onChange={(e) => handleNombreChange(e.target.value)}
                    onFocus={() => sugerenciasPacientes.length > 0 && setMostrandoSugerencias(true)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0a1826] focus:ring-2 focus:ring-[#0a1826]/10 outline-none transition-all"
                  />
                </div>

                {/* Menú flotante de autocompletado */}
                {mostrandoSugerencias && sugerenciasPacientes.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-30 max-h-40 overflow-y-auto">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Pacientes sugeridos
                    </p>
                    {sugerenciasPacientes.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => seleccionarPacienteExistente(p)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-slate-800">
                            {p.nombres} {p.apellidos || ""}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            {p.telefono}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#0a1826] font-bold">Elegir</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp / Celular
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 74649956"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0a1826] focus:ring-2 focus:ring-[#0a1826]/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Tratamiento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tratamiento
              </label>
              <select
                value={procedimiento}
                onChange={(e) => setProcedimiento(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#0a1826] focus:ring-2 focus:ring-[#0a1826]/10 outline-none transition-all cursor-pointer"
              >
                {PROCEDIMIENTOS_LANDING.map((proc) => (
                  <option key={proc.nombre} value={proc.nombre}>
                    {proc.nombre} ({proc.duracion} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Horario en Grilla Compacta */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={fechaCita}
                    onChange={(e) => {
                      setFechaCita(e.target.value);
                      setError(null);
                    }}
                    className={`w-full pl-8 pr-2 py-2 rounded-xl border text-xs font-semibold outline-none transition-all cursor-pointer ${
                      esDomingoSeleccionado
                        ? "bg-rose-50/70 border-rose-300 text-rose-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#0a1826] focus:ring-2 focus:ring-[#0a1826]/10"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Hora</span>
                  <span className="text-[10px] text-slate-400 font-medium">Fin ~{horaFinCalculada}</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="time"
                    min="09:00"
                    max="17:00"
                    step="900"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0a1826] focus:ring-2 focus:ring-[#0a1826]/10 outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Nota opcional */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nota clínica / Motivo <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <textarea
                  rows={2}
                  placeholder="Detalles sobre la molestia, motivo o recordatorio..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0a1826] focus:ring-2 focus:ring-[#0a1826]/10 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pie de Acción */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs px-5 sm:px-6 py-3 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={esDomingoSeleccionado || Boolean(conflictoHorario)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0a1826] hover:bg-[#13273d] active:bg-[#0f2236] text-white text-xs font-bold shadow-md shadow-[#0a1826]/15 hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 text-[#0ed5dc]" />
              <span>Guardar Cita</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
