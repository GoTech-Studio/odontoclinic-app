"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import {
  CalendarDays,
  Users,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Stethoscope,
  LogOut,
  UserCheck,
} from "lucide-react";

export function PanelNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Equipo");
  const [userRole, setUserRole] = useState<string>("Personal");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const saludo =
    userName.toLowerCase().includes("pamela") || userName.toLowerCase().includes("dra")
      ? "Bienvenida"
      : "Bienvenido";

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Consultar nombre del perfil si existe
          const { data: perfil } = await supabase
            .from("perfiles")
            .select("nombres, rol")
            .eq("id", user.id)
            .maybeSingle();

          if (perfil?.nombres) {
            setUserName(perfil.nombres);
            setUserRole(perfil.rol === "ODONTOLOGO" ? "Odontología" : "Gestión Clínica");
          } else if (user.email) {
            const prefix = user.email.split("@")[0];
            const capitalized = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            if (prefix.toLowerCase().includes("pamela") || prefix.toLowerCase().includes("doctora")) {
              setUserName("Dra. Pamela");
              setUserRole("Odontología");
            } else {
              setUserName(capitalized);
              setUserRole("Gestión Clínica");
            }
          }
        }
      } catch (err) {
        console.warn("No se pudo obtener usuario de sesión:", err);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const navLinks = [
    {
      label: "Agenda del Día",
      href: "/panel/citas",
      icon: CalendarDays,
      active: pathname.startsWith("/panel/citas") || pathname === "/panel",
    },
    {
      label: "Pacientes",
      href: "/panel/pacientes",
      icon: Users,
      badge: "Pronto",
      active: pathname.startsWith("/panel/pacientes"),
    },
    {
      label: "Procedimientos",
      href: "/panel/procedimientos",
      icon: Stethoscope,
      badge: "Pronto",
      active: pathname.startsWith("/panel/procedimientos"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Enlace principal */}
          <div className="flex items-center gap-6">
            <Link
              href="/panel/citas"
              className="group flex items-center gap-2 transition-transform hover:opacity-95"
            >
              <Logo size="sm" />
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#009bb3] bg-[#009bb3]/10 rounded-full border border-[#009bb3]/20">
                Panel Clínico
              </span>
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      item.active
                        ? "bg-[#009bb3] text-white shadow-xs shadow-[#009bb3]/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && !item.active && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Lado Derecho: Saludo Dinámico & Menú de Usuario */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#009bb3] to-teal-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {saludo}, {userName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    {userRole}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
              </button>

              {/* Menú de Sesión */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{userName}</p>
                    <p className="text-[10px] text-slate-500">{userRole}</p>
                  </div>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver sitio web público</span>
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              {saludo}, {userName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-rose-600 font-semibold"
            >
              Salir
            </button>
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  item.active
                    ? "bg-[#009bb3] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver sitio web público</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
