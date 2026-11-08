-- ==============================================================================
-- Migración: Módulo de Citas, Pacientes y Catálogo Odontológico
-- Odontoclinic App - Base de datos PostgreSQL (Supabase)
-- ==============================================================================

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";

-- 2. TIPOS ENUMERADOS
do $$ begin
  create type rol_usuario as enum ('ADMIN', 'ODONTOLOGO', 'ASISTENTE');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type estado_cita as enum (
    'PROGRAMADA',
    'CONFIRMADA',
    'EN_SALA_DE_ESPERA',
    'EN_ATENCION',
    'ATENDIDA',
    'CANCELADA',
    'NO_ASISTIO'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type metodo_pago as enum ('EFECTIVO', 'QR', 'TARJETA', 'TRANSFERENCIA');
exception
  when duplicate_object then null;
end $$;

-- 3. TABLA DE PERFILES (Vinculada a auth.users de Supabase)
create table if not exists public.perfiles (
  id uuid references auth.users on delete cascade primary key,
  nombres text not null,
  apellidos text not null,
  ci_dni text unique,
  telefono text,
  rol rol_usuario not null default 'ASISTENTE',
  activo boolean default true,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- 4. TABLA DE PACIENTES (Permite alta rápida con solo nombres y teléfono)
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  apellidos text not null default '',
  ci_dni text unique,
  telefono text not null,
  email text,
  fecha_nacimiento date,
  alergias text default 'Ninguna declarada',
  antecedentes_medicos text,
  contacto_emergencia text,
  creado_por uuid references public.perfiles(id) on delete set null,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- 5. CATÁLOGO DE PROCEDIMIENTOS CLÍNICOS
create table if not exists public.procedimientos_catalogo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  precio_base numeric(10, 2) not null default 0.00,
  duracion_estimada_minutos int not null default 30,
  activo boolean default true,
  creado_en timestamptz default now()
);

-- 6. TABLA DE CITAS
create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete restrict,
  odontologo_id uuid not null references public.perfiles(id) on delete restrict,
  registrado_por uuid not null references public.perfiles(id) on delete restrict,
  procedimiento_propuesto_id uuid references public.procedimientos_catalogo(id) on delete set null,
  
  fecha_hora_inicio timestamptz not null,
  fecha_hora_fin timestamptz not null,
  motivo_consulta text not null,
  estado estado_cita not null default 'PROGRAMADA',
  
  -- Marcadores de tiempo para auditoría de sala de espera y atención
  llegada_a_sala_en timestamptz,
  inicio_atencion_en timestamptz,
  fin_atencion_en timestamptz,
  
  notas text,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now(),

  -- Validación de consistencia temporal
  constraint check_rango_fechas check (fecha_hora_fin > fecha_hora_inicio)
);

-- 7. TABLA DE HISTORIAL CLÍNICO / EVOLUCIONES DE ATENCIÓN (Información médica protegida)
create table if not exists public.historial_atenciones (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete restrict,
  cita_id uuid references public.citas(id) on delete set null,
  odontologo_id uuid not null references public.perfiles(id) on delete restrict,
  procedimiento_id uuid references public.procedimientos_catalogo(id) on delete set null,
  
  -- Pieza dental tratada según nomenclatura FDI (ej: 18, 21, 36, 48) o descripción
  pieza_dental text,
  
  diagnostico text not null,
  tratamiento_realizado text not null,
  prescripcion_receta text,
  indicaciones_cuidados text,
  observaciones_privadas text,
  
  -- Array de URLs para radiografías o fotos clínicas almacenadas en Supabase Storage
  archivos_adjuntos text[] default array[]::text[],
  
  fecha_atencion timestamptz default now()
);

-- 8. TABLA DE PAGOS Y CUOTAS (Con soporte de firma digital)
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid references public.citas(id) on delete set null,
  paciente_id uuid not null references public.pacientes(id) on delete restrict,
  registrado_por uuid not null references public.perfiles(id) on delete restrict,
  
  monto numeric(10, 2) not null check (monto > 0),
  metodo metodo_pago not null default 'EFECTIVO',
  concepto text not null,
  
  -- URL o ruta en Supabase Storage de la firma digital capturada
  firma_digital_url text,
  
  notas text,
  fecha_pago timestamptz default now()
);

-- 9. ÍNDICES ESTRATÉGICOS PARA VELOCIDAD DE CONSULTA
create index if not exists idx_citas_rango_fecha on public.citas (fecha_hora_inicio, fecha_hora_fin);
create index if not exists idx_citas_odontologo on public.citas (odontologo_id);
create index if not exists idx_citas_estado on public.citas (estado);
create index if not exists idx_citas_paciente on public.citas (paciente_id);
create index if not exists idx_pacientes_telefono on public.pacientes (telefono);
create index if not exists idx_historial_paciente on public.historial_atenciones (paciente_id);
create index if not exists idx_historial_fecha on public.historial_atenciones (fecha_atencion);
create index if not exists idx_pagos_paciente on public.pagos (paciente_id);

-- 10. DATOS SEMILLA (Procedimientos sincronizados con la Landing Page de Odontoclinic)
insert into public.procedimientos_catalogo (nombre, descripcion, precio_base, duracion_estimada_minutos)
values
  ('Limpieza profunda', 'Eliminación de sarro, placa bacteriana y pulido dental', 120.00, 45),
  ('Restauraciones estéticas', 'Eliminación de tejido cariado y obturación estética con resina', 150.00, 45),
  ('Tratamiento de conducto', 'Desinfección y sellado radicular (endodoncia) por sesión', 450.00, 60),
  ('Prótesis fija y removible', 'Rehabilitación protésica y ajuste oclusal', 350.00, 45),
  ('Implantes dentales', 'Colocación o control de implante osteointegrado', 800.00, 60),
  ('Cirugías de alta complejidad', 'Procedimientos quirúrgicos especializados bucomaxilofaciales', 600.00, 60),
  ('Valoración general / Otro', 'Evaluación integral inicial o consulta general', 50.00, 30)
on conflict (nombre) do nothing;

-- 11. SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- Principio: Solo el personal autenticado de la clínica puede acceder y manipular información sensible.
alter table public.perfiles enable row level security;
alter table public.pacientes enable row level security;
alter table public.procedimientos_catalogo enable row level security;
alter table public.citas enable row level security;
alter table public.historial_atenciones enable row level security;
alter table public.pagos enable row level security;

-- Perfiles: El personal autenticado puede consultar perfiles de colegas
create policy "Personal autenticado puede ver perfiles"
  on public.perfiles for select
  to authenticated
  using (true);

create policy "Personal puede actualizar su propio perfil"
  on public.perfiles for update
  to authenticated
  using (auth.uid() = id);

-- Pacientes: Solo personal autenticado puede ver, crear y actualizar pacientes
create policy "Personal autenticado gestiona pacientes"
  on public.pacientes for all
  to authenticated
  using (true)
  with check (true);

-- Historial Médico: Confidencialidad máxima. Solo personal autenticado puede ver y registrar evoluciones
create policy "Personal autenticado gestiona historial medico"
  on public.historial_atenciones for all
  to authenticated
  using (true)
  with check (true);

-- Catálogo: Público para lectura (landing page o consultas de precios), pero solo personal edita
create policy "Cualquiera puede consultar catalogo de procedimientos"
  on public.procedimientos_catalogo for select
  using (true);

create policy "Personal autenticado gestiona procedimientos"
  on public.procedimientos_catalogo for all
  to authenticated
  using (true)
  with check (true);

-- Citas: Solo personal autenticado puede ver, agendar y cambiar estados
create policy "Personal autenticado gestiona citas"
  on public.citas for all
  to authenticated
  using (true)
  with check (true);

-- Pagos: Solo personal autenticado puede registrar y auditar transacciones
create policy "Personal autenticado gestiona pagos"
  on public.pagos for all
  to authenticated
  using (true)
  with check (true);

-- 12. DISPARADOR AUTOMÁTICO DE USUARIOS (AUTH -> PERFILES)
-- Garantiza que cada usuario creado en Supabase Auth tenga su perfil listo en public.perfiles
create policy "Personal puede insertar su propio perfil"
  on public.perfiles for insert
  to authenticated
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, nombres, apellidos, rol)
  values (
    new.id,
    initcap(coalesce(new.raw_user_meta_data->>'nombres', split_part(new.email, '@', 1))),
    coalesce(new.raw_user_meta_data->>'apellidos', ''),
    case
      when new.email ilike '%pamela%' or new.email ilike '%doctor%' then 'ODONTOLOGO'::public.rol_usuario
      else 'ASISTENTE'::public.rol_usuario
    end
  )
  on conflict (id) do update set
    nombres = excluded.nombres;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();



