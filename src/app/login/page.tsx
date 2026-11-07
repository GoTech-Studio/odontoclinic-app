"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [configMissing, setConfigMissing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigMissing(true);
    }
  }, []);

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
          "Configuración requerida en producción: Debes añadir NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel (Project Settings > Environment Variables) y volver a desplegar."
        );
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setErrorMsg(
          "Error de conexión con Supabase. Verifica tu conexión a internet o el estado del proyecto en Supabase."
        );
      } else {
        setErrorMsg(
          msg || "Ocurrió un error inesperado al conectar con el servidor."
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1826] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Fondo orgánico animado tipo lámpara de lava relajante */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Orbe 1: Cian profundo superior derecho */}
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-[#009bb3]/20 blur-[100px] animate-lava-1 mix-blend-screen" />
        
        {/* Orbe 2: Turquesa brillante inferior izquierdo */}
        <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] rounded-full bg-[#0ed5dc]/15 blur-[110px] animate-lava-2 mix-blend-screen" />
        
        {/* Orbe 3: Azul oceánico flotante central */}
        <div className="absolute top-1/3 -right-20 w-[380px] h-[380px] rounded-full bg-teal-600/15 blur-[90px] animate-lava-3 mix-blend-screen" />

        {/* Orbe 4: Menta suave flotando arriba a la izquierda */}
        <div className="absolute -top-32 left-1/4 w-[340px] h-[340px] rounded-full bg-[#008398]/15 blur-[85px] animate-lava-2 mix-blend-screen" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Cabecera / Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Logo size="md" variant="white" />
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Acceso al Panel Clínico
          </h2>
          <p className="text-xs text-slate-400">
            Ingresa con tus credenciales de acceso institucional
          </p>
        </div>

        {/* Alerta de Configuración si faltan variables en producción */}
        {configMissing && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Configuración requerida en producción</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Las variables de entorno de Supabase aún no se han configurado en el panel de Vercel (Project Settings → Environment Variables):
            </p>
            <div className="bg-black/30 p-2.5 rounded-xl text-[10px] font-mono text-amber-100 space-y-1">
              <p>• NEXT_PUBLIC_SUPABASE_URL</p>
              <p>• NEXT_PUBLIC_SUPABASE_ANON_KEY (o PUBLISHABLE_KEY)</p>
            </div>
          </div>
        )}

        {/* Tarjeta de Formulario */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 shadow-2xl border border-white/20">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="usuario@odontoclinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#009bb3] focus:ring-3 focus:ring-[#009bb3]/15 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#009bb3] hover:bg-[#008398] active:bg-[#007485] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#009bb3]/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar al Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Pie informativo del formulario */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Acceso exclusivo para el personal autorizado de la clínica.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Volver al sitio web principal
          </Link>
        </div>
      </div>
    </div>
  );
}
