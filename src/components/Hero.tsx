"use client";

import React from "react";
import { useSiteImages } from "@/lib/hooks/use-site-images";
import { GoogleReviewBadge } from "./GoogleReviewBadge";

interface HeroProps {
  onOpenBooking: () => void;
}

export function Hero({ onOpenBooking }: HeroProps) {
  const siteImages = useSiteImages();
  const heroImage = siteImages.hero;

  return (
    <section
      className="relative overflow-hidden bg-[#ebf4f7] rounded-bl-[36px] sm:rounded-bl-[44px] lg:rounded-bl-[52px] rounded-br-[29px] sm:rounded-br-[35px] lg:rounded-br-[42px] pt-8 sm:pt-12 pb-10 sm:pb-14 lg:-mt-20 lg:pt-36 lg:pb-16 shadow-sm"
      id="inicio"
    >
      {/* Decorative ambient gradient glow behind hero */}
      <div
        className="pointer-events-none absolute -top-24 -left-20 w-96 h-96 bg-cyan-200/35 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 right-10 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl"
        aria-hidden="true"
      />

      {/* Desktop Hero Image - Anchored harmoniously on desktop & ultrawide screens */}
      <div className="hidden lg:block absolute top-0 right-0 2xl:right-[max(0px,calc((100vw-1400px)/2))] w-1/2 lg:w-[46%] xl:w-[48%] 2xl:w-[680px] h-full overflow-hidden pointer-events-none z-0">
        <img
          alt={heroImage.alt}
          className="hero-image-fade w-full h-full object-cover object-[80%_top] select-none"
          src={heroImage.src}
        />

        {/* Floating Real Google Review Badge in Hero (Desktop Card) */}
        <div className="hidden lg:block absolute bottom-6 right-6 xl:bottom-8 xl:right-8 z-20 animate-float pointer-events-auto">
          <GoogleReviewBadge variant="card" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Text Content (Left Column) */}
          <div className="lg:col-span-6 z-10 pt-1 sm:pt-2">
            {/* Small Preheading */}
            <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#007485] uppercase mb-2 sm:mb-3">
              ODONTOLOGÍA MODERNA · CAMIRI
            </p>

            {/* Main Title with dual colors */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-slate-900 leading-[1.14] mb-3 sm:mb-4">
              Tu sonrisa,<br />
              <span className="text-[#009bb3]">en manos expertas.</span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-lg mb-6 sm:mb-7 leading-relaxed font-normal">
              Atención odontológica cercana con una mirada moderna al cuidado de tu sonrisa.
            </p>

            {/* WhatsApp Action Button with dynamic micro-interactions */}
            <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="group inline-flex items-center gap-3 bg-[#009bb3] hover:bg-[#008398] text-white px-7 py-3.5 rounded-full font-medium shadow-md shadow-[#009bb3]/25 hover:shadow-xl hover:shadow-[#009bb3]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                {/* WhatsApp SVG Icon */}
                <svg className="w-5 h-5 fill-current transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M12.031 2C6.516 2 2.023 6.49 2.023 12.003c0 1.83.493 3.555 1.353 5.048L2 22l5.093-1.336a9.94 9.94 0 0 0 4.938 1.341c5.513 0 10.007-4.49 10.007-10.002C22.038 6.49 17.545 2 12.031 2zm0 18.258a8.21 8.21 0 0 1-4.186-1.144l-.3-.178-3.111.816.83-3.033-.195-.311a8.204 8.204 0 0 1-1.258-4.406c0-4.55 3.702-8.25 8.22-8.25 4.518 0 8.22 3.7 8.22 8.25 0 4.551-3.702 8.256-8.22 8.256zm4.507-6.177c-.247-.123-1.463-.722-1.69-.804-.227-.083-.393-.123-.559.123-.166.247-.64 0.804-.784.968-.144.164-.288.185-.535.062-.247-.123-1.042-.384-1.986-1.226-.734-.655-1.23-1.464-1.374-1.711-.144-.247-.015-.38.109-.502.111-.11.247-.288.371-.432.124-.144.165-.247.248-.411.082-.165.041-.309-.021-.432-.062-.124-.559-1.348-.766-1.848-.201-.486-.406-.42-.559-.428h-.476c-.165 0-.434.062-.661.309-.227.247-.868.849-.868 2.07 0 1.222.889 2.404 1.013 2.569.124.165 1.75 2.673 4.238 3.748.592.256 1.054.409 1.414.523.595.19 1.137.163 1.564.099.477-.071 1.463-.598 1.669-1.175.206-.577.206-1.072.145-1.175-.062-.103-.227-.165-.474-.288z" />
                </svg>
                <span>Solicitar una cita</span>
                <span className="text-base leading-none transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>

            {/* Píldora Elegante de Google Maps en Modo Móvil (No invade la foto) */}
            <div className="block lg:hidden mb-4">
              <GoogleReviewBadge variant="pill" />
            </div>

            {/* Mobile Image (Limpia, nítida y sin elementos encimados) */}
            <div className="block lg:hidden relative my-5">
              <div className="relative overflow-hidden rounded-3xl shadow-sm border border-slate-200/60 aspect-[4/3] sm:aspect-[16/10]">
                <img
                  alt={heroImage.alt}
                  className="w-full h-full object-cover object-[75%_18%] select-none"
                  src={heroImage.src}
                />
              </div>
            </div>

            {/* Value Propositions 4-column row - Centered on mobile, strictly 1-line on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 lg:gap-3.5 xl:gap-5 pt-3 border-t border-slate-200/70 max-w-lg lg:max-w-[540px] xl:max-w-[570px]">
              {/* Feature 1 */}
              <div className="group flex flex-col items-center text-center sm:items-start sm:text-left space-y-1.5 p-1 rounded-xl transition-all">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-[#009bb3] group-hover:scale-105 group-hover:bg-[#009bb3] group-hover:text-white transition-all duration-200">
                  <svg className="w-5 h-5 stroke-current fill-none stroke-[1.9]" viewBox="0 0 24 24">
                    <path
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-800 tracking-tight text-center sm:text-left sm:whitespace-nowrap">
                  Tecnología moderna
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group flex flex-col items-center text-center sm:items-start sm:text-left space-y-1.5 p-1 rounded-xl transition-all">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-[#009bb3] group-hover:scale-105 group-hover:bg-[#009bb3] group-hover:text-white transition-all duration-200">
                  <svg className="w-5 h-5 stroke-current fill-none stroke-[1.9]" viewBox="0 0 24 24">
                    <path
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-800 tracking-tight text-center sm:text-left sm:whitespace-nowrap">
                  Atención cercana
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group flex flex-col items-center text-center sm:items-start sm:text-left space-y-1.5 p-1 rounded-xl transition-all">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-[#009bb3] group-hover:scale-105 group-hover:bg-[#009bb3] group-hover:text-white transition-all duration-200">
                  <svg className="w-5 h-5 stroke-current fill-none stroke-[1.9]" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.5 14c1 1.5 2.2 2 3.5 2s2.5-.5 3.5-2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-800 tracking-tight text-center sm:text-left sm:whitespace-nowrap">
                  Resultados reales
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group flex flex-col items-center text-center sm:items-start sm:text-left space-y-1.5 p-1 rounded-xl transition-all">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-[#009bb3] group-hover:scale-105 group-hover:bg-[#009bb3] group-hover:text-white transition-all duration-200">
                  <svg className="w-5 h-5 stroke-current fill-none stroke-[1.9]" viewBox="0 0 24 24">
                    <path
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-800 tracking-tight text-center sm:text-left sm:whitespace-nowrap">
                  Tu bienestar primero
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Spacer Column */}
          <div className="hidden lg:block lg:col-span-6" />
        </div>
      </div>
    </section>
  );
}
