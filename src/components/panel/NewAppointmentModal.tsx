"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Check,
  AlertCircle,
  AlertTriangle,
  Search,
  CheckCircle2,
  CalendarDays,
  Sparkles,
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

export function NewAppointmentModal({
  isOpen,
  onClose,
  selectedDate: initialDate,
  onSaveAppointment,
}: NewAppointmentModalProps) {
  // Fecha libre de la cita (permite agendar para cualquier día futuro por WhatsApp)
  const [fechaCita, setFechaCita] = useState(initialDate);

  // Datos del paciente
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [sugerenciasPacientes, setSugerenciasPacientes] = useState<Paciente[]>([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState(false);

  // Detalle del servicio y horario
  const [procedimiento, setProcedimiento] = useState(PROCEDIMIENTOS_LANDING[0].nombre);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [motivo, setMotivo] = useState("");

  // Estado de solapamiento y citas ocupadas del día elegido
  const [citasDelDia, setCitasDelDia] = useState<Cita[]>([]);
  const [conflictoHorario, setConflictoHorario] = useState<{ paciente: string; hora: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar fecha inicial al abrir
  useEffect(() => {
    if (isOpen) {
      setFechaCita(initialDate);
    }
  }, [isOpen, initialDate]);

  // Cargar las citas ocupadas de la fecha seleccionada para advertir visualmente
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

  // Búsqueda en vivo de pacientes para autocompletar
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

  // Cálculo automático de hora de fin con matemática pura (sin new Date para compatibilidad con prerender de Next.js)
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

  // Verificación en vivo de solapamiento cuando cambia la hora o fecha
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

  // Validación de horario físico de atención
  const validarHorarioAtencion = (fechaStr: string, inicio: string) => {
    const fechaObj = new Date(fechaStr + "T00:00:00");
    const diaSemana = fechaObj.getDay(); // 0: Dom, 1: Lun ... 6: Sáb
    const [h, m] = inicio.split(":").map(Number);
    const minutosInicio = h * 60 + m;

    if (diaSemana === 0) {
      return "La clínica no atiende los domingos. Por favor selecciona de lunes a sábado.";
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
        `Conflicto de horario: Ya existe una cita a las ${conflictoHorario.hora} con ${conflictoHorario.paciente}. Como la doctora atiende 1 a 1, elige otro horario disponible.`
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

    // Reset y cerrar
    setNombre("");
    setTelefono("");
    setMotivo("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col my-8">
        {/* Cabecera */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 to-[#0a1826] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#009bb3] flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Nueva Cita Odontoclinic
              </h3>
              <p className="text-xs text-teal-200/80 font-medium">
                Agendamiento directo o por WhatsApp (1 a 1)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector Libre de Fecha */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#009bb3]" />
            <span className="text-xs font-bold text-slate-700">Fecha de la cita:</span>
          </div>
          <input
            type="date"
            value={fechaCita}
            onChange={(e) => setFechaCita(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#009bb3] outline-none shadow-2xs cursor-pointer"
          />
        </div>

        {/* Resumen de Horarios Ocupados en esa fecha (Para saber qué decirle al paciente por WhatsApp) */}
        {citasDelDia.length > 0 && (
          <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-200/60 text-[11px] text-amber-900">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Horarios ya ocupados en esta fecha ({citasDelDia.length}):</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {citasDelDia.map((c) => {
                const ini = new Date(c.fecha_hora_inicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
                const fin = new Date(c.fecha_hora_fin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
                const pac = c.paciente ? c.paciente.nombres.split(" ")[0] : "Ocupado";
                return (
                  <span
                    key={c.id}
                    className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-800 font-semibold text-[10px]"
                  >
                    {ini} - {fin} ({pac})
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Alerta en tiempo real de Solapamiento de Horario */}
          {conflictoHorario && (
            <div className="flex items-start gap-2.5 p-3 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded-2xl animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p>¡Horario Ocupado!</p>
                <p className="text-[11px] font-normal text-amber-800 mt-0.5">
                  A esa hora ya está agendado <strong>{conflictoHorario.paciente}</strong> ({conflictoHorario.hora}). Como la doctora atiende 1 a 1, elige otro horario libre.
                </p>
              </div>
            </div>
          )}

          {/* Datos del Paciente (con Autocompletado en vivo) */}
          <div className="space-y-3 relative">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Datos del Paciente
            </p>

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre y Apellidos (Escribe para buscar o registrar)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Flores..."
                  value={nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  onFocus={() => sugerenciasPacientes.length > 0 && setMostrandoSugerencias(true)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all"
                />
              </div>

              {/* Menú flotante de autocompletado de pacientes existentes */}
              {mostrandoSugerencias && sugerenciasPacientes.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-30 max-h-44 overflow-y-auto">
                  <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Pacientes registrados previamente
                  </p>
                  {sugerenciasPacientes.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => seleccionarPacienteExistente(p)}
                      className="w-full text-left px-3 py-2 hover:bg-teal-50/70 transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          {p.nombres} {p.apellidos || ""}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-2">
                          Cel: {p.telefono}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#009bb3] font-bold">Seleccionar</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Celular / WhatsApp (Para confirmaciones)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="Ej. 74649956"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Procedimiento y Horario */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Servicio Odontológico y Hora
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tratamiento
              </label>
              <select
                value={procedimiento}
                onChange={(e) => setProcedimiento(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all cursor-pointer"
              >
                {PROCEDIMIENTOS_LANDING.map((proc) => (
                  <option key={proc.nombre} value={proc.nombre}>
                    {proc.nombre} ({proc.duracion} min)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hora de Inicio
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    min="09:00"
                    max="17:00"
                    step="900"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hora Fin (Estimada)
                </label>
                <div className="w-full px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>{horaFinCalculada}</span>
                  <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                    Auto
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo de la consulta / Nota (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Me contactó por WhatsApp para curación molar..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={Boolean(conflictoHorario)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#009bb3] hover:bg-[#008398] active:bg-[#007485] text-white text-xs font-bold shadow-md shadow-[#009bb3]/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cita</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
