"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  XCircle,
  MessageCircle,
  Armchair,
  Stethoscope,
  AlertTriangle,
  Timer,
  Undo2,
  RefreshCw,
  Database,
  Bell,
  BellOff,
  CalendarClock,
  Send,
  Volume2,
} from "lucide-react";
import { NewAppointmentModal } from "@/components/panel/NewAppointmentModal";
import { createClient } from "@/lib/supabase/client";
import {
  getCitasPorFecha,
  registrarCitaRapida,
  actualizarEstadoCitaSupabase,
} from "@/lib/services/citas-supabase";
import { Cita, EstadoCita } from "@/types/database.types";
import { clinicChime } from "@/lib/utils/audio-chime";

interface CitaViewModel {
  id: string;
  pacienteNombre: string;
  pacienteTelefono: string;
  horaInicio: string; // formato "HH:MM"
  horaFin: string;    // formato "HH:MM"
  procedimientoNombre: string;
  motivo: string;
  estado: EstadoCita;
  llegadaHora?: string;
  inicioAtencionHora?: string;
  finAtencionHora?: string;
}

// Datos de demostración en caso de que la base de datos esté vacía
const DEMO_CITAS: CitaViewModel[] = [
  {
    id: "demo-1",
    pacienteNombre: "Mariana Justiniano",
    pacienteTelefono: "59174649956",
    horaInicio: "09:00",
    horaFin: "09:45",
    procedimientoNombre: "Limpieza profunda",
    motivo: "Limpieza preventiva semestral",
    estado: "EN_SALA_DE_ESPERA",
    llegadaHora: "08:52",
  },
  {
    id: "demo-2",
    pacienteNombre: "Carlos Morales Vaca",
    pacienteTelefono: "59178912345",
    horaInicio: "10:00",
    horaFin: "10:45",
    procedimientoNombre: "Restauraciones estéticas",
    motivo: "Molestia al masticar en el molar superior derecho",
    estado: "PROGRAMADA",
  },
  {
    id: "demo-3",
    pacienteNombre: "Elena Rojas Peña",
    pacienteTelefono: "59171234567",
    horaInicio: "11:00",
    horaFin: "12:00",
    procedimientoNombre: "Tratamiento de conducto",
    motivo: "Continuación de tratamiento endodóntico",
    estado: "PROGRAMADA",
  },
];

export default function CitasPage() {
  const [citas, setCitas] = useState<CitaViewModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("2026-11-07");
  const [loading, setLoading] = useState(true);
  const [isLiveFromDb, setIsLiveFromDb] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<{ id: string; email?: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Notificaciones de sonido (timbre relajante y no chilloso con switch para silenciar)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [turnoAlerta, setTurnoAlerta] = useState<{
    paciente: string;
    hora: string;
    procedimiento: string;
  } | null>(null);
  const notificadosRef = useRef<Set<string>>(new Set());

  // Reloj seguro para SSR/Prerender que se inicializa en el cliente y se actualiza cada 30 segundos
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Cargar preferencia de sonido desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("odontoclinic_sonido_activo");
      if (stored !== null) {
        setSoundEnabled(stored === "true");
      }
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }, []);

  const toggleSound = () => {
    const nuevo = !soundEnabled;
    setSoundEnabled(nuevo);
    try {
      localStorage.setItem("odontoclinic_sonido_activo", String(nuevo));
    } catch {}
    if (nuevo) {
      // Reproducir preview suave para que verifiquen el volumen no intrusivo
      clinicChime.playTurnoChime();
    }
  };

  const probarSonidoManual = () => {
    clinicChime.playTurnoChime();
  };

  // Hoy en formato "YYYY-MM-DD"
  const getHoyStr = useCallback(() => {
    if (!currentTime) return "";
    const y = currentTime.getFullYear();
    const m = String(currentTime.getMonth() + 1).padStart(2, "0");
    const d = String(currentTime.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [currentTime]);

  const hoyStr = getHoyStr();
  const esHoy = Boolean(currentTime && currentDate === hoyStr);
  const esFuturo = Boolean(currentTime && currentDate > hoyStr);
  const esPasado = Boolean(currentTime && currentDate < hoyStr);

  // NAVEGACIÓN TOTAL POR FECHAS (Día a día dinámico, botón hoy y selector libre)
  const navegarDia = (diasDelta: number) => {
    const [y, m, d] = currentDate.split("-").map(Number);
    const fechaObj = new Date(y, m - 1, d);
    fechaObj.setDate(fechaObj.getDate() + diasDelta);

    const nuevoY = fechaObj.getFullYear();
    const nuevoM = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const nuevoD = String(fechaObj.getDate()).padStart(2, "0");
    setCurrentDate(`${nuevoY}-${nuevoM}-${nuevoD}`);
  };

  const irAHoy = () => {
    const ahora = new Date();
    const y = ahora.getFullYear();
    const m = String(ahora.getMonth() + 1).padStart(2, "0");
    const d = String(ahora.getDate()).padStart(2, "0");
    setCurrentDate(`${y}-${m}-${d}`);
  };

  const formatearFechaEspanol = (fechaStr: string) => {
    try {
      const [y, m, d] = fechaStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const opciones: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      const texto = date.toLocaleDateString("es-ES", opciones);
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    } catch {
      return fechaStr;
    }
  };

  const obtenerEtiquetaRelativa = (fechaStr: string) => {
    if (!currentTime) return null;
    const hoyY = currentTime.getFullYear();
    const hoyM = String(currentTime.getMonth() + 1).padStart(2, "0");
    const hoyD = String(currentTime.getDate()).padStart(2, "0");
    const actualStr = `${hoyY}-${hoyM}-${hoyD}`;

    if (fechaStr === actualStr) return "Hoy";

    const [y, m, d] = fechaStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const hoy = new Date(hoyY, currentTime.getMonth(), currentTime.getDate());
    const diffDias = Math.round((date.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 1) return "Mañana";
    if (diffDias === -1) return "Ayer";
    if (diffDias > 1) return `En ${diffDias} días`;
    if (diffDias < -1) return `Hace ${Math.abs(diffDias)} días`;
    return null;
  };

  // Función para convertir una fila de Supabase a CitaViewModel
  const mapSupabaseToView = (c: Cita): CitaViewModel => {
    const inicioDate = new Date(c.fecha_hora_inicio);
    const finDate = new Date(c.fecha_hora_fin);

    const horaInicio = inicioDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    const horaFin = finDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

    const llegadaHora = c.llegada_a_sala_en
      ? new Date(c.llegada_a_sala_en).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      : undefined;

    const inicioAtencionHora = c.inicio_atencion_en
      ? new Date(c.inicio_atencion_en).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      : undefined;

    return {
      id: c.id,
      pacienteNombre: c.paciente ? `${c.paciente.nombres} ${c.paciente.apellidos || ""}`.trim() : "Paciente",
      pacienteTelefono: c.paciente?.telefono || "",
      horaInicio,
      horaFin,
      procedimientoNombre: c.procedimiento?.nombre || "Consulta general",
      motivo: c.motivo_consulta,
      estado: c.estado,
      llegadaHora,
      inicioAtencionHora,
    };
  };

  // Carga de citas desde Supabase
  const cargarCitas = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUsuarioActual(user);

      if (!user) {
        // Si no está logueado, mostramos datos de demo para que no se vea vacío
        setCitas(DEMO_CITAS);
        setIsLiveFromDb(false);
        setLoading(false);
        return;
      }

      // Si está logueado, consultamos Supabase directamente
      const datosDb = await getCitasPorFecha(currentDate);

      if (datosDb.length === 0) {
        setCitas([]);
      } else {
        setCitas(datosDb.map(mapSupabaseToView));
      }
      setIsLiveFromDb(true);
    } catch (err) {
      console.warn("Usando datos de muestra (no se pudo conectar con Supabase):", err);
      setCitas(DEMO_CITAS);
      setIsLiveFromDb(false);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  // Filtros por estado del minimundo
  const programadas = citas.filter((c) => c.estado === "PROGRAMADA");
  const enSala = citas.filter((c) => c.estado === "EN_SALA_DE_ESPERA");
  const enAtencion = citas.filter((c) => c.estado === "EN_ATENCION");
  const atendidas = citas.filter((c) => c.estado === "ATENDIDA");
  const noAsistieron = citas.filter((c) => c.estado === "NO_ASISTIO");

  // Monitoreo de turnos para emitir sonido no chilloso y aviso visual
  useEffect(() => {
    if (!soundEnabled || !esHoy || !currentTime) return;

    const horaActual = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    programadas.forEach((cita) => {
      if (cita.horaInicio === horaActual && !notificadosRef.current.has(cita.id)) {
        notificadosRef.current.add(cita.id);
        clinicChime.playTurnoChime();
        setTurnoAlerta({
          paciente: cita.pacienteNombre,
          hora: cita.horaInicio,
          procedimiento: cita.procedimientoNombre,
        });

        // Auto-cerrar la notificación a los 9 segundos
        setTimeout(() => {
          setTurnoAlerta((prev) => (prev?.paciente === cita.pacienteNombre ? null : prev));
        }, 9000);
      }
    });
  }, [currentTime, soundEnabled, esHoy, programadas]);

  // 1. CÁLCULO INTELIGENTE DE RETRASO (Alerta visual automática SOLO para citas del día de HOY)
  const evaluarAtraso = (cita: CitaViewModel) => {
    if (!currentTime || !esHoy) {
      return { atrasado: false, minutosTarde: 0 };
    }

    const [h, m] = cita.horaInicio.split(":").map(Number);
    const citaDate = new Date(currentTime);
    citaDate.setHours(h, m, 0, 0);

    const diffMinutos = Math.floor((currentTime.getTime() - citaDate.getTime()) / 60000);

    // Solo si hoy ya pasaron más de 10 minutos de la hora pactada y sigue programada
    return {
      atrasado: diffMinutos >= 10,
      minutosTarde: diffMinutos,
    };
  };

  // 2. CÁLCULO DE TIEMPO EN SALA DE ESPERA (Control de atención en vivo para el día de HOY)
  const calcularMinutosEspera = (llegadaHora?: string) => {
    if (!llegadaHora || !currentTime || !esHoy) return 10;

    const [h, m] = llegadaHora.split(":").map(Number);
    const llegadaDate = new Date(currentTime);
    llegadaDate.setHours(h, m, 0, 0);
    const diff = Math.max(1, Math.floor((currentTime.getTime() - llegadaDate.getTime()) / 60000));
    return diff;
  };

  // 3. GENERADOR DE MENSAJE WHATSAPP DE SEGUIMIENTO (1 clic para retrasos de hoy)
  const buildWhatsAppFollowUpUrl = (nombre: string, telefono: string, hora: string) => {
    const primerNombre = nombre.trim().split(" ")[0];
    const mensaje = `Hola ${primerNombre}, te escribimos de Odontoclinic 👋. ¿Estás en camino a tu cita de las ${hora}? Por favor avísanos si necesitas unos minutos para esperarte.`;
    return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  };

  // 4. GENERADOR DE RECORDATORIO ANTICIPADO POR WHATSAPP (Para citas de días futuros)
  const buildWhatsAppReminderUrl = (nombre: string, telefono: string, fechaStr: string, hora: string) => {
    const primerNombre = nombre.trim().split(" ")[0];
    const fechaTexto = formatearFechaEspanol(fechaStr);
    const mensaje = `Hola ${primerNombre}, te escribimos de Odontoclinic 👋. Te recordamos tu cita odontológica programada para el ${fechaTexto} a las ${hora}. ¿Nos confirmas tu asistencia? ¡Te esperamos!`;
    return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  };

  // TRANSICIONES DE ESTADO (Actualiza en UI y en Supabase si está conectado)
  const cambiarEstado = async (id: string, nuevoEstado: EstadoCita) => {
    const ahora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Actualización optimista en el cliente
    setCitas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const actualizado: CitaViewModel = { ...c, estado: nuevoEstado };
        if (nuevoEstado === "EN_SALA_DE_ESPERA") actualizado.llegadaHora = ahora;
        if (nuevoEstado === "EN_ATENCION") actualizado.inicioAtencionHora = ahora;
        if (nuevoEstado === "ATENDIDA") actualizado.finAtencionHora = ahora;
        return actualizado;
      })
    );

    // Si no es un id demo, actualizar en Supabase
    if (isLiveFromDb && !id.startsWith("demo-")) {
      try {
        await actualizarEstadoCitaSupabase(id, nuevoEstado);
      } catch (err) {
        console.error("Error al persistir en Supabase:", err);
      }
    }
  };

  // REGISTRAR CITA NUEVA (Permite agendar para hoy o cualquier fecha futura)
  const handleCrearCita = async (nueva: {
    pacienteNombre: string;
    pacienteTelefono: string;
    procedimientoNombre: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    motivo: string;
  }) => {
    setActionError(null);
    setSuccessMessage(null);
    try {
      const creada = await registrarCitaRapida(nueva);
      if (nueva.fecha === currentDate) {
        setCitas((prev) => [...prev, mapSupabaseToView(creada)]);
      } else {
        setSuccessMessage(
          `¡Cita agendada con éxito para el ${nueva.fecha} a las ${nueva.horaInicio} con ${nueva.pacienteNombre}!`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido al registrar cita";
      console.error("Error al registrar en Supabase:", err);
      setActionError(msg);

      if (nueva.fecha === currentDate) {
        const item: CitaViewModel = {
          id: String(Date.now()),
          ...nueva,
          estado: "PROGRAMADA",
        };
        setCitas((prev) => [...prev, item]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de Conexión con Supabase */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2">
          {isLiveFromDb ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conectado en vivo a Supabase PostgreSQL</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>Modo Demostración local (Inicia sesión en /login para escribir en vivo)</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={cargarCitas}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Refrescar citas"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Alerta de Error si ocurre algo al guardar en Supabase */}
      {actionError && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs text-rose-500 hover:text-rose-800 font-bold px-2 py-0.5 rounded-lg hover:bg-rose-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Notificación de Éxito al agendar cita futura por WhatsApp */}
      {successMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-600 hover:text-emerald-900 font-bold px-2 py-0.5 rounded-lg hover:bg-emerald-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra de Control Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Selector de Fecha Dinámico */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              title="Haz clic para elegir cualquier fecha en el calendario"
            />
            <div className="w-11 h-11 rounded-2xl bg-[#009bb3]/10 text-[#009bb3] hover:bg-[#009bb3] hover:text-white flex items-center justify-center transition-all shadow-2xs group-hover:scale-105 cursor-pointer">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navegarDia(-1)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer active:scale-95 shadow-2xs"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {formatearFechaEspanol(currentDate)}
                </h2>

                {/* Badge de Hoy / Mañana / En X días / Ayer */}
                {obtenerEtiquetaRelativa(currentDate) && (
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-2xs ${
                      esHoy
                        ? "bg-[#009bb3] text-white"
                        : esFuturo
                        ? "bg-sky-100 text-sky-800 border border-sky-300"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {obtenerEtiquetaRelativa(currentDate)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => navegarDia(1)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer active:scale-95 shadow-2xs"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Botón rápido "Ir a Hoy" si están en otra fecha */}
              {!esHoy && (
                <button
                  type="button"
                  onClick={irAHoy}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#009bb3] hover:bg-[#009bb3]/10 border border-[#009bb3]/30 transition-all cursor-pointer shadow-2xs ml-1"
                >
                  Ir a Hoy
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-slate-500 font-medium">
                {citas.length === 0
                  ? "Sin citas para este día • Espacio libre"
                  : `${citas.length} citas registradas`}
              </p>
              <span className="text-slate-300">•</span>
              <label className="text-[11px] text-[#009bb3] hover:underline font-semibold cursor-pointer relative">
                <span>Cambiar fecha</span>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Resumen de Estado (KPIs) & Controles de Notificación */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Toggle de Sonido de Turnos (Timbre suave y relajante con opción de silencio) */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-white text-[#009bb3] shadow-xs border border-slate-200/60"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title={
                soundEnabled
                  ? "Avisos sonoros activos (timbre suave). Haz clic para silenciar."
                  : "Avisos sonoros silenciados. Haz clic para activar."
              }
            >
              {soundEnabled ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-[#009bb3]" />
                  <span className="hidden sm:inline text-[11px]">Sonido ON</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline text-[11px]">Silenciado</span>
                </>
              )}
            </button>

            {soundEnabled && (
              <button
                type="button"
                onClick={probarSonidoManual}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#009bb3] hover:bg-slate-200/50 transition-colors cursor-pointer"
                title="Probar sonido relajante"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold">{enSala.length}</span>
            <span className="text-[11px] font-medium text-amber-700">en sala</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-teal-50 border border-teal-200/70 text-teal-800">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-xs font-bold">{enAtencion.length}</span>
            <span className="text-[11px] font-medium text-teal-700">en sillón</span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#009bb3] hover:bg-[#008398] active:bg-[#007485] text-white text-xs font-bold shadow-md shadow-[#009bb3]/20 hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo según la Temporalidad de la Fecha */}
      {esFuturo && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 text-sky-900 text-xs font-medium animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="w-4 h-4 text-[#009bb3] shrink-0" />
            <span>
              <strong>Modo Planificación ({formatearFechaEspanol(currentDate)}):</strong> Las citas para este día están agendadas con anticipación. Puedes enviar recordatorios por WhatsApp o reprogramar. El registro de llegada a sala y paso al sillón se habilitará automáticamente el día de la cita.
            </span>
          </div>
          <button
            type="button"
            onClick={irAHoy}
            className="shrink-0 px-2.5 py-1 rounded-xl bg-white border border-sky-200 text-[#009bb3] hover:bg-sky-100/60 font-bold text-[11px] transition-colors cursor-pointer ml-3 shadow-2xs"
          >
            Volver a Hoy
          </button>
        </div>
      )}

      {esPasado && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Modo Historial / Auditoría ({formatearFechaEspanol(currentDate)}):</strong> Esta jornada ya concluyó. Estás visualizando el registro de atenciones en modo de consulta histórica protegida.
            </span>
          </div>
          <button
            type="button"
            onClick={irAHoy}
            className="shrink-0 px-2.5 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-[11px] transition-colors cursor-pointer ml-3 shadow-2xs"
          >
            Ir a Hoy
          </button>
        </div>
      )}

      {/* Tablero Kanban Clínico de 3 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ================= COLUMNA 1: CITAS PROGRAMADAS ================= */}
        <div className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {esHoy ? "Programadas Hoy" : esFuturo ? "Agendadas para el día" : "Citas de la fecha"} ({programadas.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Por horario</span>
          </div>

          {programadas.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-white/70 border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
              <p className="font-semibold text-slate-700">Sin citas para esta fecha</p>
              <p className="text-[11px] text-slate-400">
                Todo el horario está disponible para recibir pacientes.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#009bb3] text-white font-bold text-[11px] shadow-xs hover:bg-[#008398] transition-all cursor-pointer mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agendar en este día</span>
              </button>
            </div>
          ) : (
            programadas.map((cita) => {
              const { atrasado, minutosTarde } = evaluarAtraso(cita);

              return (
                <div
                  key={cita.id}
                  className={`rounded-2xl p-4 border transition-all space-y-3 ${
                    atrasado
                      ? "bg-gradient-to-b from-amber-50/70 to-white border-amber-300 shadow-sm"
                      : "bg-white border-slate-200/80 shadow-xs hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {cita.horaInicio} - {cita.horaFin}
                      </span>

                      {atrasado && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{minutosTarde} min tarde</span>
                        </span>
                      )}

                      {esFuturo && (
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          Agendada
                        </span>
                      )}
                    </div>

                    <a
                      href={
                        esFuturo
                          ? buildWhatsAppReminderUrl(
                              cita.pacienteNombre,
                              cita.pacienteTelefono,
                              currentDate,
                              cita.horaInicio
                            )
                          : atrasado
                          ? buildWhatsAppFollowUpUrl(
                              cita.pacienteNombre,
                              cita.pacienteTelefono,
                              cita.horaInicio
                            )
                          : `https://wa.me/${cita.pacienteTelefono}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className={`p-1.5 rounded-lg transition-colors ${
                        atrasado
                          ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs"
                          : esFuturo
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title={
                        esFuturo
                          ? "Enviar recordatorio anticipado por WhatsApp"
                          : atrasado
                          ? "Escribir al paciente para consultar si está en camino"
                          : "Abrir WhatsApp"
                      }
                    >
                      {esFuturo ? <Send className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                    </a>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug">
                      {cita.pacienteNombre}
                    </h4>
                    <p className="text-xs font-medium text-[#009bb3]">
                      {cita.procedimientoNombre}
                    </p>
                    {cita.motivo && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {cita.motivo}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {esHoy && (
                      <>
                        <button
                          type="button"
                          onClick={() => cambiarEstado(cita.id, "NO_ASISTIO")}
                          className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Marcar No Asistió
                        </button>

                        <button
                          type="button"
                          onClick={() => cambiarEstado(cita.id, "EN_SALA_DE_ESPERA")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200/80 transition-all cursor-pointer shadow-2xs hover:scale-102"
                        >
                          <Armchair className="w-3.5 h-3.5 text-amber-600" />
                          <span>Llegó a clínica</span>
                        </button>
                      </>
                    )}

                    {esFuturo && (
                      <>
                        <button
                          type="button"
                          onClick={() => cambiarEstado(cita.id, "NO_ASISTIO")}
                          className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Cancelar Cita
                        </button>

                        <a
                          href={buildWhatsAppReminderUrl(
                            cita.pacienteNombre,
                            cita.pacienteTelefono,
                            currentDate,
                            cita.horaInicio
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200/80 transition-all cursor-pointer shadow-2xs"
                        >
                          <Send className="w-3 h-3 text-emerald-600" />
                          <span>Enviar Recordatorio</span>
                        </a>
                      </>
                    )}

                    {esPasado && (
                      <>
                        <span className="text-[11px] text-slate-400 italic">
                          Cita no procesada en el día
                        </span>
                        <button
                          type="button"
                          onClick={() => cambiarEstado(cita.id, "NO_ASISTIO")}
                          className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Cerrar como Ausente
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ================= COLUMNA 2: EN SALA DE ESPERA ================= */}
        <div className="bg-amber-50/50 rounded-3xl p-4 border border-amber-200/60 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                En Sala de Espera ({enSala.length})
              </h3>
            </div>
            {esHoy ? (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                Físicamente aquí
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400">
                Recepción
              </span>
            )}
          </div>

          {enSala.length === 0 ? (
            esFuturo ? (
              <div className="p-6 text-center rounded-2xl bg-white/70 border border-dashed border-amber-200 text-amber-800/70 text-xs space-y-1.5">
                <Armchair className="w-6 h-6 text-amber-500/60 mx-auto mb-1" />
                <p className="font-bold text-amber-900">Sala en reposo para este día</p>
                <p className="text-[11px] text-amber-700/80">
                  La sala física de recepción se activa el día de la cita cuando los pacientes se presentan en la clínica.
                </p>
              </div>
            ) : esPasado ? (
              <div className="p-6 text-center rounded-2xl bg-white/70 border border-dashed border-slate-200 text-slate-500 text-xs">
                Sin pacientes pendientes en sala para esta fecha.
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-white/70 border border-dashed border-amber-200 text-amber-800/60 text-xs">
                No hay pacientes esperando en la sala en este momento.
              </div>
            )
          ) : (
            enSala.map((cita) => {
              const minutosEspera = calcularMinutosEspera(cita.llegadaHora);
              const esperaProlongada = minutosEspera > 20;

              return (
                <div
                  key={cita.id}
                  className="bg-white rounded-2xl p-4 border-2 border-amber-300 shadow-md space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />

                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      Llegó {cita.llegadaHora || "08:30"}
                    </div>
                    {esHoy && (
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          esperaProlongada
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Timer className="w-3 h-3" />
                        <span>{minutosEspera} min en sala</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {cita.pacienteNombre}
                    </h4>
                    <p className="text-xs font-semibold text-[#009bb3]">
                      {cita.procedimientoNombre}
                    </p>
                    {cita.motivo && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {cita.motivo}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    {esHoy ? (
                      <button
                        type="button"
                        onClick={() => cambiarEstado(cita.id, "EN_ATENCION")}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#009bb3] hover:bg-[#008398] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Hacer pasar al sillón</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => cambiarEstado(cita.id, "PROGRAMADA")}
                        className="w-full flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Undo2 className="w-3 h-3" />
                        <span>Regresar a Programada</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ================= COLUMNA 3: EN SILLÓN / ATENCIÓN ACTIVA ================= */}
        <div className="bg-teal-50/50 rounded-3xl p-4 border border-teal-200/60 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                En Sillón con la Doctora ({enAtencion.length})
              </h3>
            </div>
            {esHoy && enAtencion.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                1 a 1 activo
              </span>
            )}
          </div>

          {enAtencion.length === 0 ? (
            esFuturo ? (
              <div className="p-6 text-center rounded-2xl bg-white/70 border border-dashed border-teal-200 text-teal-800/70 text-xs space-y-1.5">
                <Stethoscope className="w-6 h-6 text-teal-500/60 mx-auto mb-1" />
                <p className="font-bold text-teal-900">Sillón clínico programado</p>
                <p className="text-[11px] text-teal-700/80">
                  La atención personalizada de la Dra. Pamela se habilitará durante la jornada del día.
                </p>
              </div>
            ) : esPasado ? (
              <div className="p-6 text-center rounded-2xl bg-white/70 border border-dashed border-slate-200 text-slate-500 text-xs">
                Jornada médica concluida para esta fecha.
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-white/70 border border-dashed border-teal-200 text-teal-800/60 text-xs">
                El sillón está libre. Puedes hacer pasar al siguiente paciente de la sala.
              </div>
            )
          ) : (
            enAtencion.map((cita) => (
              <div
                key={cita.id}
                className="bg-white rounded-2xl p-4 border-2 border-teal-400 shadow-md space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-[#009bb3]" />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    Ingresó {cita.inicioAtencionHora || "09:10"}
                  </span>
                  <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                    En consulta
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {cita.pacienteNombre}
                  </h4>
                  <p className="text-xs font-bold text-[#009bb3]">
                    {cita.procedimientoNombre}
                  </p>
                  {cita.motivo && (
                    <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {cita.motivo}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cambiarEstado(cita.id, "ATENDIDA")}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Finalizar atención</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sección Inferior: Atendidas e Inasistencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Atendidas / Completadas */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {esHoy ? "Citas Finalizadas Hoy" : "Citas Finalizadas"} ({atendidas.length})
              </h3>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              Completadas
            </span>
          </div>

          {atendidas.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No se han registrado citas finalizadas para este día.</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {atendidas.map((cita) => (
                <div
                  key={cita.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">{cita.pacienteNombre}</p>
                      <p className="text-[11px] text-slate-500">{cita.procedimientoNombre}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {cita.inicioAtencionHora || cita.horaInicio} - {cita.finAtencionHora || cita.horaFin}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inasistencias */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {esHoy ? "Inasistencias Registradas Hoy" : "Inasistencias Registradas"} ({noAsistieron.length})
              </h3>
            </div>
            <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
              Ausentes
            </span>
          </div>

          {noAsistieron.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Ningún paciente con inasistencia registrada para este día.</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {noAsistieron.map((cita) => (
                <div
                  key={cita.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">{cita.pacienteNombre}</p>
                      <p className="text-[11px] text-slate-500">{cita.horaInicio} • {cita.procedimientoNombre}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => cambiarEstado(cita.id, "PROGRAMADA")}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Reactivar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notificación Flotante Discreta al Llegar la Hora del Turno */}
      {turnoAlerta && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-3xl p-4 border-2 border-[#009bb3] shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#009bb3]/10 text-[#009bb3] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#009bb3]">
                  Hora de Turno ({turnoAlerta.hora})
                </span>
                <button
                  type="button"
                  onClick={() => setTurnoAlerta(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <h5 className="text-sm font-bold text-slate-900 mt-0.5">{turnoAlerta.paciente}</h5>
              <p className="text-xs text-slate-500 font-medium">{turnoAlerta.procedimiento}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Es hora de su cita. Puedes verificar si ya ingresó a la sala de espera.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nueva Cita */}
      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={currentDate}
        onSaveAppointment={handleCrearCita}
      />
    </div>
  );
}
