"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Menu, X, User } from "lucide-react";
import { NAV_SECTIONS } from "@/config/site-config";

interface NavbarProps {
  onOpenBooking: () => void;
}

export function Navbar({ onOpenBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("inicio");
  const isClickingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const activeSections = NAV_SECTIONS.filter((s) => s.enabled);

  useEffect(() => {
    // Sincronizar hash inicial si el usuario ingresó directamente con #seccion
    if (typeof window !== "undefined" && window.location.hash) {
      const initialId = window.location.hash.replace("#", "");
      if (activeSections.some((s) => s.id === initialId)) {
        setActiveId(initialId);
      }
    }

    const handleScroll = () => {
      if (isClickingRef.current) return;

      // Si está en el tope superior de la página
      if (window.scrollY < 80) {
        setActiveId("inicio");
        return;
      }

      // Si llegó al final del scroll, marcar la última sección activa
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60;

      if (isAtBottom) {
        const lastSection = activeSections[activeSections.length - 1];
        if (lastSection) {
          setActiveId(lastSection.id);
          return;
        }
      }

      const headerHeight = headerRef.current?.offsetHeight ?? 80;
      const scrollPosition = window.scrollY + headerHeight + 60;

      let currentId = "inicio";
      for (const section of activeSections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentId = section.id;
          }
        }
      }

      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [activeSections]);

  const handleSectionNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (!href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    setMobileMenuOpen(false);

    const targetId = href.replace("#", "");
    setActiveId(targetId);
    isClickingRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickingRef.current = false;
    }, 1000);

    window.history.replaceState(null, "", href);

    if (href === "#inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Freeze reveal transforms while measuring so the target cannot move
    // underneath the sticky navbar during the smooth scroll.
    const revealWrapper = target.closest(".reveal");
    revealWrapper?.classList.add("reveal-visible", "reveal-navigation-target");
    target.classList.add("reveal-navigation-target");

    window.requestAnimationFrame(() => {
      const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });

      window.setTimeout(() => {
        revealWrapper?.classList.remove("reveal-navigation-target");
        target.classList.remove("reveal-navigation-target");
      }, 900);
    });
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`navbar-entry sticky top-0 z-40 w-full bg-white shadow-none md:shadow-sm border-b-0 lg:border-b border-slate-100/70 transition-all duration-300 ${
          mobileMenuOpen ? "rounded-b-none" : "rounded-b-[28px] sm:rounded-b-[36px]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            className="flex items-center gap-2.5 group"
            href="#inicio"
            onClick={(event) => handleSectionNavigation(event, "#inicio")}
          >
            <Logo size="md" />
          </a>

          {/* Desktop Navigation Menu (Driven by NAV_SECTIONS) */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium">
            {activeSections.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  className={`transition-colors hover:text-[#007485] ${
                    isActive ? "text-slate-900 font-semibold" : "text-slate-600"
                  }`}
                  href={item.href}
                  onClick={(event) => handleSectionNavigation(event, item.href)}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* CTA Appointment Button & Staff Login */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full text-xs font-semibold text-slate-500 hover:text-[#007485] hover:bg-slate-100/80 transition-all cursor-pointer"
              title="Acceso al Panel Clínico (Equipo)"
            >
              <User className="w-4 h-4 text-slate-400 group-hover:text-[#007485]" />
              <span className="hidden lg:inline">Acceso Equipo</span>
            </Link>

            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="group hidden sm:inline-flex items-center gap-2 bg-[#0f2236] hover:bg-[#009bb3] text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:scale-[1.04] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              {/* WhatsApp Icon */}
              <svg className="w-4 h-4 fill-current text-white shrink-0 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                <path d="M12.031 2C6.516 2 2.023 6.49 2.023 12.003c0 1.83.493 3.555 1.353 5.048L2 22l5.093-1.336a9.94 9.94 0 0 0 4.938 1.341c5.513 0 10.007-4.49 10.007-10.002C22.038 6.49 17.545 2 12.031 2zm0 18.258a8.21 8.21 0 0 1-4.186-1.144l-.3-.178-3.111.816.83-3.033-.195-.311a8.204 8.204 0 0 1-1.258-4.406c0-4.55 3.702-8.25 8.22-8.25 4.518 0 8.22 3.7 8.22 8.25 0 4.551-3.702 8.256-8.22 8.256zm4.507-6.177c-.247-.123-1.463-.722-1.69-.804-.227-.083-.393-.123-.559.123-.166.247-.64 0.804-.784.968-.144.164-.288.185-.535.062-.247-.123-1.042-.384-1.986-1.226-.734-.655-1.23-1.464-1.374-1.711-.144-.247-.015-.38.109-.502.111-.11.247-.288.371-.432.124-.144.165-.247.248-.411.082-.165.041-.309-.021-.432-.062-.124-.559-1.348-.766-1.848-.201-.486-.406-.42-.559-.428h-.476c-.165 0-.434.062-.661.309-.227.247-.868.849-.868 2.07 0 1.222.889 2.404 1.013 2.569.124.165 1.75 2.673 4.238 3.748.592.256 1.054.409 1.414.523.595.19 1.137.163 1.564.099.477-.071 1.463-.598 1.669-1.175.206-.577.206-1.072.145-1.175-.062-.103-.227-.165-.474-.288z" />
              </svg>
              <span>Agendar una cita</span>
            </button>

            {/* Hamburger móvil con animación de rotación y fade */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden relative w-10 h-10 rounded-xl text-slate-700 hover:text-[#007485] hover:bg-slate-100 active:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer select-none"
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

        {/* Menú móvil flotante superpuesto (no desplaza el hero) */}
        <div
          className={`md:hidden absolute top-full -mt-px left-0 right-0 z-40 bg-white rounded-b-[28px] shadow-2xl shadow-slate-900/15 transition-all duration-300 ease-in-out origin-top overflow-hidden ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto max-h-[500px]"
              : "opacity-0 -translate-y-3 pointer-events-none max-h-0"
          }`}
        >
          <div className="px-5 pt-3 pb-6 space-y-1 divide-y divide-slate-100/80">
            <div className="space-y-1 pb-2">
              {activeSections.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <a
                    key={item.id}
                    onClick={(event) => handleSectionNavigation(event, item.href)}
                    href={item.href}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-sm transition-all ${
                      isActive
                        ? "font-semibold text-slate-900 bg-slate-100/90"
                        : "font-medium text-slate-700 hover:text-[#007485] hover:bg-[#ebf4f7]/70 active:bg-[#ebf4f7]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-xs ${isActive ? "text-[#007485] font-bold" : "text-slate-400"}`}>
                      →
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#009bb3] hover:bg-[#008398] active:bg-[#007485] text-white py-3 rounded-full text-sm font-medium shadow-md shadow-[#009bb3]/25 transition-all cursor-pointer"
              >
                {/* WhatsApp Icon */}
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 2C6.516 2 2.023 6.49 2.023 12.003c0 1.83.493 3.555 1.353 5.048L2 22l5.093-1.336a9.94 9.94 0 0 0 4.938 1.341c5.513 0 10.007-4.49 10.007-10.002C22.038 6.49 17.545 2 12.031 2zm0 18.258a8.21 8.21 0 0 1-4.186-1.144l-.3-.178-3.111.816.83-3.033-.195-.311a8.204 8.204 0 0 1-1.258-4.406c0-4.55 3.702-8.25 8.22-8.25 4.518 0 8.22 3.7 8.22 8.25 0 4.551-3.702 8.256-8.22 8.256zm4.507-6.177c-.247-.123-1.463-.722-1.69-.804-.227-.083-.393-.123-.559.123-.166.247-.64 0.804-.784.968-.144.164-.288.185-.535.062-.247-.123-1.042-.384-1.986-1.226-.734-.655-1.23-1.464-1.374-1.711-.144-.247-.015-.38.109-.502.111-.11.247-.288.371-.432.124-.144.165-.247.248-.411.082-.165.041-.309-.021-.432-.062-.124-.559-1.348-.766-1.848-.201-.486-.406-.42-.559-.428h-.476c-.165 0-.434.062-.661.309-.227.247-.868.849-.868 2.07 0 1.222.889 2.404 1.013 2.569.124.165 1.75 2.673 4.238 3.748.592.256 1.054.409 1.414.523.595.19 1.137.163 1.564.099.477-.071 1.463-.598 1.669-1.175.206-.577.206-1.072.145-1.175-.062-.103-.227-.165-.474-.288z" />
                </svg>
                <span>Solicitar una cita</span>
                <span>→</span>
              </button>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#007485] hover:bg-slate-50 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Acceso Equipo / Panel Clínico</span>
                <span className="text-slate-400">→</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop oscuro con desenfoque suave al abrir el menú (cierra al tocar fuera) */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 top-18 sm:top-20 bg-slate-900/30 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
    </>
  );
}
