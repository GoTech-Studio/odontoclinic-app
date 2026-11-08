"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Stethoscope,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [configMissing, setConfigMissing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigMissing(true);
    }

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevHtmlPosition = document.documentElement.style.position;
    const prevHtmlHeight = document.documentElement.style.height;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyHeight = document.body.style.height;

    // Bloqueo estricto del viewport y rebote de iOS/WebKit
    document.documentElement.classList.add("login-lock");
    document.body.classList.add("login-lock");
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.position = "fixed";
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    const preventOverscroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(".allow-touch-scroll")) {
        e.preventDefault();
      }
    };

    window.addEventListener("touchmove", preventOverscroll, { passive: false });

    return () => {
      document.documentElement.classList.remove("login-lock");
      document.body.classList.remove("login-lock");
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.documentElement.style.position = prevHtmlPosition;
      document.documentElement.style.height = prevHtmlHeight;
      document.documentElement.style.width = "";
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.height = prevBodyHeight;
      document.body.style.width = "";
      window.removeEventListener("touchmove", preventOverscroll);
    };
  }, []);

  // Interacción de halo luminoso que sigue suavemente el cursor en escritorio
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      const { clientWidth, clientHeight } = e.currentTarget;
      const x = Math.round((e.clientX / clientWidth) * 100);
      const y = Math.round((e.clientY / clientHeight) * 100);
      setMousePos({ x, y });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        setErrorMsg(
          "Configuración pendiente en producción: Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel."
        );
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Correo o contraseña incorrectos. Verifica tus credenciales.");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMsg("Este correo aún no ha sido confirmado en Supabase Auth.");
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push("/panel/citas");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Detalle del error en login:", err);
      const msg = err instanceof Error ? err.message : "";
      if (
        msg.includes("variables de entorno") ||
        msg.includes("required to create a Supabase client") ||
        msg.includes("API key are required")
      ) {
        setErrorMsg(
          "Configuración requerida en producción: Debes añadir NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel y volver a desplegar."
        );
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setErrorMsg(
          "Error de conexión con Supabase. Verifica tu conexión a internet o el estado del servicio."
        );
      } else {
        setErrorMsg(msg || "Ocurrió un error inesperado al conectar con el servidor.");
      }
      setLoading(false);
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="login-page-wrapper fixed inset-0 w-full h-full h-dvh bg-gradient-to-br from-[#071626] via-[#0d2238] to-[#0a1826] text-slate-800 flex flex-col justify-center items-center px-4 sm:px-6 overflow-hidden select-none z-50 touch-none"
    >
      {/* Atmósfera Clínica Luminosa & Dinámica (Ondas turquesa de Odontoclinic) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Halo interactivo de luz cian sensible al cursor */}
        <div
          className="absolute w-[580px] h-[580px] rounded-full blur-[115px] transition-all duration-700 ease-out opacity-35 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            background: "radial-gradient(circle, rgba(14,213,220,0.3) 0%, rgba(0,155,179,0.18) 45%, transparent 70%)",
          }}
        />

        {/* Ondas orgánicas de fondo (animación visible tanto en móviles como en PC) */}
        <div className="absolute -top-16 sm:top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-1/4 w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full bg-gradient-to-tr from-[#009bb3]/35 to-[#0ed5dc]/30 blur-[75px] sm:blur-[95px] animate-lava-1 mix-blend-screen" />
        <div className="absolute -bottom-20 sm:bottom-0 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-1/4 w-[380px] sm:w-[520px] h-[380px] sm:h-[520px] rounded-full bg-gradient-to-br from-[#007485]/35 to-[#0ed5dc]/25 blur-[80px] sm:blur-[100px] animate-lava-2 mix-blend-screen" />
        <div className="hidden sm:block absolute top-1/2 -left-20 w-[340px] h-[340px] rounded-full bg-[#009bb3]/20 blur-[85px] animate-lava-3 mix-blend-screen" />

        {/* Destellos sutiles de pulcritud dental */}
        <div className="absolute top-1/4 left-1/6 w-2 h-2 rounded-full bg-cyan-200 animate-sparkle" />
        <div className="absolute bottom-1/3 right-1/5 w-2.5 h-2.5 rounded-full bg-teal-200 animate-sparkle [animation-delay:1.5s]" />
        <div className="hidden sm:block absolute top-2/3 left-1/4 w-2 h-2 rounded-full bg-white animate-sparkle [animation-delay:2.5s]" />
      </div>

      {/* Badges Flotantes Interactivos de la Clínica (visibles en pantallas medianas/grandes) */}
      <div className="hidden xl:flex items-center gap-2.5 absolute top-10 left-12 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs shadow-lg transition-all hover:scale-105 cursor-default select-none animate-float pointer-events-auto">
        <Stethoscope className="w-3.5 h-3.5 text-[#0ed5dc]" />
        <span className="font-medium">Dra. Pamela Claros • Camiri</span>
      </div>

      <div className="hidden xl:flex items-center gap-2.5 absolute bottom-10 right-12 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs shadow-lg transition-all hover:scale-105 cursor-default select-none animate-float [animation-delay:2s] pointer-events-auto">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-medium">Agenda Clínica & Pacientes</span>
      </div>

      {/* Contenedor Central de Acceso */}
      <div className="w-full max-w-[420px] space-y-3.5 sm:space-y-4 relative z-10 px-1">
        {/* Cabecera / Identidad Oficial */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Link
              href="/"
              className="inline-flex items-center p-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/20 touch-auto"
              title="Volver a la página principal de Odontoclinic"
            >
              <Logo size="md" variant="white" />
            </Link>
          </div>

          {/* Badge de área clínica */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0ed5dc]/15 border border-[#0ed5dc]/35 text-[11px] font-semibold text-[#0ed5dc] shadow-sm tracking-wide">
            <Sparkles className="w-3 h-3 text-[#0ed5dc]" />
            <span>Área Médica & Administrativa</span>
          </div>

          <h1 className="text-2xl sm:text-[1.65rem] font-bold text-white tracking-tight leading-tight">
            Acceso al Sistema
          </h1>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Ingresa para gestionar citas, agenda y expedientes odontológicos
          </p>
        </div>

        {/* Alerta de Configuración (solo si faltan variables en producción) */}
        {configMissing && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs space-y-2 backdrop-blur-md animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Configuración requerida en producción</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Las variables de entorno de Supabase aún no se han configurado en Vercel:
            </p>
            <div className="bg-black/40 p-2 rounded-xl text-[10px] font-mono text-amber-100 space-y-1">
              <p>• NEXT_PUBLIC_SUPABASE_URL</p>
              <p>• NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
            </div>
          </div>
        )}

        {/* Tarjeta Clínica Inmaculada (Alto Contraste y Calidez Humana) */}
        <div className="relative rounded-[26px] sm:rounded-[32px] p-5 sm:p-7 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-black/35 overflow-hidden">
          {/* Acento con el degradado oficial de Odontoclinic en la parte superior */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#009bb3] via-[#0ed5dc] to-[#009bb3]" />

          <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
            {/* Mensaje de error dinámico */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Campo: Correo Institucional */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 pl-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009bb3] transition-colors" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="doctor@odontoclinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-4 focus:ring-[#009bb3]/15 outline-none transition-all touch-auto"
                />
              </div>
            </div>

            {/* Campo: Contraseña con botón Ver/Ocultar */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 pl-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009bb3] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-4 focus:ring-[#009bb3]/15 outline-none transition-all touch-auto"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer touch-auto"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón Principal de Acceso (idéntico a la paleta de la landing: Azul Marino -> Cian) */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#0f2236] hover:bg-[#009bb3] active:scale-[0.98] text-white font-medium text-xs sm:text-sm shadow-md shadow-slate-900/15 hover:shadow-lg hover:shadow-[#009bb3]/25 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none touch-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Validando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Pie informativo de seguridad clínica */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#009bb3] shrink-0" />
            <span>Sistema clínico protegido y confidencial</span>
          </div>
        </div>

        {/* Enlace de regreso al sitio principal */}
        <div className="text-center pt-0.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors py-1 px-3 rounded-full hover:bg-white/10 touch-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la página principal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
