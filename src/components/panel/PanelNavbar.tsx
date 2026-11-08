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
} from "lucide-react";

export function PanelNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Equipo");
  const [userRole, setUserRole] = useState<string>("Equipo Odontoclinic");
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
          const { data: perfil } = await supabase
            .from("perfiles")
            .select("nombres, rol")
            .eq("id", user.id)
            .maybeSingle();

          if (perfil?.nombres) {
            setUserName(perfil.nombres);
            setUserRole("Equipo Odontoclinic");
          } else if (user.email) {
            const prefix = user.email.split("@")[0];
            const capitalized = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            if (prefix.toLowerCase().includes("pamela") || prefix.toLowerCase().includes("doctora")) {
              setUserName("Dra. Pamela");
              setUserRole("Equipo Odontoclinic");
            } else {
              setUserName(capitalized);
              setUserRole("Equipo Odontoclinic");
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
    <>
      <header
        className={`panel-navbar sticky top-0 z-40 bg-[#0a1826] shadow-md border-b border-slate-800/80 transition-all duration-300 ${
          mobileMenuOpen ? "rounded-b-none" : "rounded-b-[28px] sm:rounded-b-[36px]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo y Enlace principal con versión blanca oficial */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/panel/citas"
              className="group flex items-center gap-2.5 transition-transform hover:opacity-95"
            >
              <Logo size="md" variant="white" />
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0ed5dc] bg-[#0ed5dc]/15 rounded-full border border-[#0ed5dc]/30">
                Panel Clínico
              </span>
            </Link>
          </div>

          {/* Navegación Desktop adaptada al tono oscuro */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-300">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-2 transition-colors ${
                    item.active
                      ? "text-[#0ed5dc] font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      item.active ? "text-[#0ed5dc]" : "text-slate-400 group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && !item.active && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800/90 text-slate-400 font-medium border border-slate-700/60">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Lado Derecho: Acceso Sitio Web + Avatar Usuario + Menú Móvil */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer border border-slate-700/60"
              title="Ver sitio web público"
            >
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0ed5dc]" />
              <span className="hidden lg:inline">Sitio Web</span>
            </Link>

            {/* Menú de Usuario Desktop / Pill de Perfil */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-slate-800/90 bg-slate-900/40 border border-slate-700/50 text-left transition-all cursor-pointer group"
                aria-label="Perfil de usuario"
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#0a1826] font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-white/20 shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-200 leading-tight">
                    {userRole}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform hidden sm:block shrink-0 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Menú Dropdown de Sesión Desktop */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0e2135] shadow-2xl border border-slate-700/70 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
                    <div className="px-3.5 py-2 border-b border-slate-700/60">
                      <p className="text-xs font-bold text-white">{userName}</p>
                      <p className="text-[10px] text-slate-400">{userRole}</p>
                    </div>
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ver sitio web público</span>
                    </Link>
                    <div className="my-1 border-t border-slate-700/60" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Hamburger móvil con animación adaptado al tono oscuro */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden relative w-10 h-10 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer select-none"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              <span
                className={`absolute transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? "rotate-90 opacity-0 scale-75" : "rotate-0 opacity-100 scale-100"
                }`}
              >
                <Menu className="w-6 h-6 stroke-[2.2]" />
              </span>
              <span
                className={`absolute transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-75"
                }`}
              >
                <X className="w-6 h-6 stroke-[2.2]" />
              </span>
            </button>
          </div>
        </div>

        {/* Menú móvil flotante superpuesto - Estilo adaptado al tono oscuro */}
        <div
          className={`md:hidden absolute top-full -mt-px left-0 right-0 w-full z-40 bg-[#0a1826] rounded-b-[28px] sm:rounded-b-[36px] shadow-2xl shadow-black/50 border-t border-slate-800/80 transition-all duration-300 ease-in-out origin-top overflow-hidden text-slate-200 ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto max-h-[500px]"
              : "opacity-0 -translate-y-3 pointer-events-none max-h-0"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-6 space-y-1 divide-y divide-slate-800/80">
            {/* Tarjeta de usuario */}
            <div className="pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-[#0a1826] font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-white/20 shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">
                    {saludo}, <span className="text-[#0ed5dc]">{userName}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">{userRole}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors border border-rose-500/30 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>

            {/* Enlaces de navegación */}
            <div className="space-y-1 py-3">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      item.active
                        ? "bg-[#0ed5dc]/15 text-[#0ed5dc] font-semibold border border-[#0ed5dc]/25"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60 active:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${item.active ? "text-[#0ed5dc]" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium border border-slate-700/60">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">→</span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Enlace al Sitio Web Público */}
            <div className="pt-3">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Ver sitio web público</span>
                <span className="text-slate-500">→</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop para cerrar al tocar afuera cuando el menú móvil está abierto */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
