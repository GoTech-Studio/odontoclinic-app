import { createClient } from "@/lib/supabase/client";
import { Cita, Paciente, ProcedimientoCatalogo, EstadoCita } from "@/types/database.types";

export interface NuevaCitaPayload {
  pacienteNombre: string;
  pacienteTelefono: string;
  procedimientoNombre: string;
  fecha: string; // "YYYY-MM-DD"
  horaInicio: string; // "HH:MM"
  horaFin: string; // "HH:MM"
  motivo: string;
}

/**
 * Obtiene las citas del día seleccionado desde Supabase con sus relaciones (paciente, procedimiento)
 */
export async function getCitasPorFecha(fechaStr: string) {
  const supabase = createClient();

  const inicioDia = `${fechaStr}T00:00:00.000Z`;
  const finDia = `${fechaStr}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from("citas")
    .select(`
      *,
      paciente:pacientes(*),
      odontologo:perfiles!citas_odontologo_id_fkey(*),
      procedimiento:procedimientos_catalogo(*)
    `)
    .gte("fecha_hora_inicio", inicioDia)
    .lte("fecha_hora_inicio", finDia)
    .order("fecha_hora_inicio", { ascending: true });

  if (error) {
    console.warn("Aviso al consultar citas de Supabase:", error.message);
    return [];
  }

  return (data as unknown as Cita[]) || [];
}

/**
 * Busca pacientes existentes por nombre o teléfono para autocompletar en el formulario
 */
export async function buscarPacientesExistentes(termino: string): Promise<Paciente[]> {
  if (!termino || termino.trim().length < 2) return [];

  const supabase = createClient();
  const clean = termino.trim();

  const { data, error } = await supabase
    .from("pacientes")
    .select("*")
    .or(`nombres.ilike.%${clean}%,telefono.ilike.%${clean}%`)
    .limit(5);

  if (error) {
    console.warn("Aviso al buscar pacientes:", error.message);
    return [];
  }

  return (data as Paciente[]) || [];
}

/**
 * Verifica si hay solapamiento de horario con otra cita en la misma fecha (Doctora atiende 1 a 1)
 */
export async function verificarSolapamientoHorario(
  fechaStr: string,
  horaInicioStr: string,
  horaFinStr: string,
  citaExcluirId?: string
): Promise<{ disponible: boolean; citaConflicto?: { paciente: string; hora: string } }> {
  const citasDia = await getCitasPorFecha(fechaStr);

  const [inicioH, inicioM] = horaInicioStr.split(":").map(Number);
  const [finH, finM] = horaFinStr.split(":").map(Number);
  const nuevoInicioMin = inicioH * 60 + inicioM;
  const nuevoFinMin = finH * 60 + finM;

  for (const cita of citasDia) {
    // Ignorar citas canceladas, inasistencias o la misma cita en edición
    if (cita.estado === "CANCELADA" || cita.estado === "NO_ASISTIO" || cita.id === citaExcluirId) {
      continue;
    }

    const cInicioDate = new Date(cita.fecha_hora_inicio);
    const cFinDate = new Date(cita.fecha_hora_fin);

    const cInicioMin = cInicioDate.getHours() * 60 + cInicioDate.getMinutes();
    const cFinMin = cFinDate.getHours() * 60 + cFinDate.getMinutes();

    // Condición de solapamiento: (NuevoInicio < CitaFin) && (NuevoFin > CitaInicio)
    if (nuevoInicioMin < cFinMin && nuevoFinMin > cInicioMin) {
      const horaStr = `${String(cInicioDate.getHours()).padStart(2, "0")}:${String(cInicioDate.getMinutes()).padStart(2, "0")} - ${String(cFinDate.getHours()).padStart(2, "0")}:${String(cFinDate.getMinutes()).padStart(2, "0")}`;
      return {
        disponible: false,
        citaConflicto: {
          paciente: cita.paciente ? `${cita.paciente.nombres} ${cita.paciente.apellidos || ""}`.trim() : "Paciente agendado",
          hora: horaStr,
        },
      };
    }
  }

  return { disponible: true };
}

/**
 * Registra una cita rápida creando el paciente si aún no existe,
 * con protección completa contra fallos de claves foráneas.
 */
export async function registrarCitaRapida(payload: NuevaCitaPayload) {
  const supabase = createClient();

  // 1. Obtener usuario actual autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const usuarioId = user?.id;

  // 2. Verificar y asegurar que el usuario tenga su fila en public.perfiles
  let perfilValidoId: string | null = null;

  if (usuarioId) {
    // Intentar buscar perfil existente
    const { data: perfilExistente } = await supabase
      .from("perfiles")
      .select("id")
      .eq("id", usuarioId)
      .maybeSingle();

    if (perfilExistente) {
      perfilValidoId = perfilExistente.id;
    } else {
      // Si no existe, intentar insertarlo
      const emailPrefix = user.email ? user.email.split("@")[0] : "Personal";
      const nombreSugerido = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

      const { data: nuevoPerfil, error: errInsertPerfil } = await supabase
        .from("perfiles")
        .insert({
          id: usuarioId,
          nombres: user.user_metadata?.nombres || (user.email?.includes("pamela") ? "Dra. Pamela Claros" : nombreSugerido),
          apellidos: "",
          rol: user.email?.toLowerCase().includes("pamela") || user.email?.toLowerCase().includes("doctor")
            ? "ODONTOLOGO"
            : "ASISTENTE",
          activo: true,
        })
        .select("id")
        .maybeSingle();

      if (nuevoPerfil) {
        perfilValidoId = nuevoPerfil.id;
      } else if (errInsertPerfil) {
        console.warn("Aviso al auto-crear perfil (puede requerir ejecutar script SQL):", errInsertPerfil.message);
      }
    }
  }

  // 3. Buscar si el paciente ya existe por su teléfono
  let pacienteId: string | null = null;
  const { data: pacienteExistente } = await supabase
    .from("pacientes")
    .select("id")
    .eq("telefono", payload.pacienteTelefono)
    .maybeSingle();

  if (pacienteExistente?.id) {
    pacienteId = pacienteExistente.id;
  } else {
    // Crear el paciente nuevo (creado_por es nullable: si perfilValidoId no está listo, pasa null para que nunca falle)
    const pacienteInsertData: Record<string, unknown> = {
      nombres: payload.pacienteNombre,
      apellidos: "",
      telefono: payload.pacienteTelefono,
    };
    if (perfilValidoId) {
      pacienteInsertData.creado_por = perfilValidoId;
    }

    const { data: nuevoPaciente, error: errPaciente } = await supabase
      .from("pacientes")
      .insert(pacienteInsertData)
      .select("id")
      .single();

    if (errPaciente || !nuevoPaciente) {
      console.error("Error al registrar paciente en Supabase:", errPaciente?.message || errPaciente);
      throw new Error(`Error al guardar paciente: ${errPaciente?.message || "Permiso denegado o error de conexión."}`);
    }
    pacienteId = nuevoPaciente.id;
  }

  // 4. Buscar o vincular el procedimiento en el catálogo
  let procedimientoId: string | null = null;
  const { data: procExistente } = await supabase
    .from("procedimientos_catalogo")
    .select("id")
    .eq("nombre", payload.procedimientoNombre)
    .maybeSingle();

  if (procExistente?.id) {
    procedimientoId = procExistente.id;
  } else {
    const { data: nuevoProc } = await supabase
      .from("procedimientos_catalogo")
      .insert({
        nombre: payload.procedimientoNombre,
        descripcion: "Servicio clínico de Odontoclinic",
        duracion_estimada_minutos: 45,
        precio_base: 100.0,
      })
      .select("id")
      .maybeSingle();

    if (nuevoProc?.id) {
      procedimientoId = nuevoProc.id;
    }
  }

  // 5. Determinar odontólogo responsable (busca rol ODONTOLOGO en perfiles o usa perfil actual)
  const { data: doctor } = await supabase
    .from("perfiles")
    .select("id")
    .eq("rol", "ODONTOLOGO")
    .eq("activo", true)
    .maybeSingle();

  // Si no hay perfil con rol ODONTOLOGO, usamos perfilValidoId o el primer perfil disponible
  let odontologoId = doctor?.id || perfilValidoId;

  if (!odontologoId) {
    const { data: primerPerfil } = await supabase
      .from("perfiles")
      .select("id")
      .limit(1)
      .maybeSingle();
    odontologoId = primerPerfil?.id;
  }

  if (!odontologoId) {
    throw new Error(
      "Aún no hay ningún perfil registrado en la tabla 'perfiles'. Por favor ejecuta el script de sincronización en el SQL Editor de Supabase."
    );
  }

  // 6. Construir timestamps ISO
  const fechaHoraInicio = new Date(`${payload.fecha}T${payload.horaInicio}:00`).toISOString();
  const fechaHoraFin = new Date(`${payload.fecha}T${payload.horaFin}:00`).toISOString();

  // 7. Insertar la cita
  const { data: nuevaCita, error: errCita } = await supabase
    .from("citas")
    .insert({
      paciente_id: pacienteId,
      odontologo_id: odontologoId,
      registrado_por: perfilValidoId || odontologoId,
      procedimiento_propuesto_id: procedimientoId,
      fecha_hora_inicio: fechaHoraInicio,
      fecha_hora_fin: fechaHoraFin,
      motivo_consulta: payload.motivo,
      estado: "PROGRAMADA",
    })
    .select(`
      *,
      paciente:pacientes(*),
      odontologo:perfiles!citas_odontologo_id_fkey(*),
      procedimiento:procedimientos_catalogo(*)
    `)
    .single();

  if (errCita) {
    console.error("Error al registrar cita en Supabase:", errCita.message);
    throw new Error(`Error al agendar cita: ${errCita.message}`);
  }

  return nuevaCita as unknown as Cita;
}

/**
 * Actualiza el estado de la cita con marcas de tiempo automáticas
 */
export async function actualizarEstadoCitaSupabase(citaId: string, nuevoEstado: EstadoCita) {
  const supabase = createClient();
  const ahora = new Date().toISOString();

  const updatePayload: Record<string, unknown> = {
    estado: nuevoEstado,
    actualizado_en: ahora,
  };

  if (nuevoEstado === "EN_SALA_DE_ESPERA") {
    updatePayload.llegada_a_sala_en = ahora;
  } else if (nuevoEstado === "EN_ATENCION") {
    updatePayload.inicio_atencion_en = ahora;
  } else if (nuevoEstado === "ATENDIDA") {
    updatePayload.fin_atencion_en = ahora;
  }

  const { error } = await supabase
    .from("citas")
    .update(updatePayload)
    .eq("id", citaId);

  if (error) {
    console.error("Error al actualizar estado en Supabase:", error.message);
    throw error;
  }
}
