export type RolUsuario = 'ADMIN' | 'ODONTOLOGO' | 'ASISTENTE';

export type EstadoCita =
  | 'PROGRAMADA'
  | 'CONFIRMADA'
  | 'EN_SALA_DE_ESPERA'
  | 'EN_ATENCION'
  | 'ATENDIDA'
  | 'CANCELADA'
  | 'NO_ASISTIO';

export type MetodoPago = 'EFECTIVO' | 'QR' | 'TARJETA' | 'TRANSFERENCIA';

export interface Perfil {
  id: string; // references auth.users
  nombres: string;
  apellidos: string;
  ci_dni: string | null;
  telefono: string | null;
  rol: RolUsuario;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  ci_dni: string | null;
  telefono: string;
  email: string | null;
  fecha_nacimiento: string | null;
  alergias: string | null;
  antecedentes_medicos: string | null;
  contacto_emergencia: string | null;
  creado_por: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface ProcedimientoCatalogo {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  duracion_estimada_minutos: number;
  activo: boolean;
  creado_en: string;
}

export interface Cita {
  id: string;
  paciente_id: string;
  odontologo_id: string;
  registrado_por: string;
  procedimiento_propuesto_id: string | null;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  motivo_consulta: string;
  estado: EstadoCita;
  llegada_a_sala_en: string | null;
  inicio_atencion_en: string | null;
  fin_atencion_en: string | null;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  // Campos anidados opcionales al hacer JOIN en Supabase
  paciente?: Paciente;
  odontologo?: Perfil;
  registrador?: Perfil;
  procedimiento?: ProcedimientoCatalogo;
}

export interface Pago {
  id: string;
  cita_id: string | null;
  paciente_id: string;
  registrado_por: string;
  monto: number;
  metodo: MetodoPago;
  concepto: string;
  firma_digital_url: string | null;
  notas: string | null;
  fecha_pago: string;
}

export interface HistorialAtencion {
  id: string;
  paciente_id: string;
  cita_id: string | null;
  odontologo_id: string;
  procedimiento_id: string | null;
  pieza_dental: string | null;
  diagnostico: string;
  tratamiento_realizado: string;
  prescripcion_receta: string | null;
  indicaciones_cuidados: string | null;
  observaciones_privadas: string | null;
  archivos_adjuntos: string[];
  fecha_atencion: string;
  // Campos anidados opcionales al hacer JOIN
  paciente?: Paciente;
  odontologo?: Perfil;
  procedimiento?: ProcedimientoCatalogo;
}

