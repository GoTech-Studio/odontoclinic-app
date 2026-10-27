"use client";

import React from "react";
import Image from "next/image";
import { UserCheck, Sparkles, Heart } from "lucide-react";
import { useSiteImages } from "@/lib/hooks/use-site-images";

interface DoctorProfileProps {
  onOpenBooking: () => void;
}

export function DoctorProfile({ onOpenBooking }: DoctorProfileProps) {
  const siteImages = useSiteImages();
  const doctorImage = siteImages.doctor;

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-[#fbfcfd] border-y border-slate-100" id="doctora">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Doctor Photo (Left) */}
          <div className="lg:col-span-4">
            <div className="relative group overflow-hidden rounded-2xl shadow-sm border border-slate-200/70 bg-white">
              <Image
                alt={doctorImage.alt}
                src={doctorImage.src}
                width={452}
                height={516}
                className="w-full h-[380px] sm:h-[450px] object-cover object-center transition-transform duration-500 group-hover:scale-105"
                priority
                unoptimized
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/70 shadow-sm flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  {doctorImage.label || "Dra. Pamela Claros"}
                </span>
                <span className="text-[10px] font-bold text-[#007485] bg-[#ebf4f7] px-2 py-0.5 rounded-full">Odontología</span>
              </div>
            </div>
          </div>

          {/* Doctor Bio and Details (Right) */}
          <div className="lg:col-span-5 space-y-4">
            <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#007485] uppercase">
              CONOCE A LA DOCTORA
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Dra. Pamela Claros
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Apasionada por la salud bucal y comprometida con brindar una atención de calidad, la
              Dra. Pamela Claros te acompaña en cada etapa de tu tratamiento, con un trato cercano y
              profesional.
            </p>

            {/* Mobile Trust Pillars (Visible on mobile/tablet) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 pb-1 lg:hidden">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-[#ebf4f7] text-[#007485] flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-medium text-slate-800">Atención cercana</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-[#ebf4f7] text-[#007485] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-medium text-slate-800">Salud bucal integral</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-[#ebf4f7] text-[#007485] flex items-center justify-center shrink-0">
                  <Heart className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-medium text-slate-800">Tu bienestar primero</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="btn-pill-outline inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer"
              >
                <span>Conoce más sobre ella</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Doctor Pillars (Rightmost Column - visible on desktop/laptop, hidden on mobile) */}
          <div className="hidden lg:block relative lg:col-span-3 space-y-8 pl-10">
            {/* Elegant vertical tapered divider on desktop */}
            <div
              className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-gradient-to-b from-transparent via-[#009bb3]/45 to-transparent rounded-full"
              aria-hidden="true"
            />

            {/* Item 1: Atención cercana y profesional */}
            <div className="flex items-center gap-4 group">
              <div className="shrink-0">
                <svg className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 32 32" fill="none">
                  <defs>
                    <linearGradient id="docPersonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="10%" stopColor="#0f2236" />
                      <stop offset="90%" stopColor="#009bb3" />
                    </linearGradient>
                  </defs>
                  {/* Head */}
                  <circle
                    cx="16"
                    cy="10"
                    r="4.8"
                    stroke="url(#docPersonGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Shoulders */}
                  <path
                    d="M7 25C7 20.2 11 17.5 16 17.5C21 17.5 25 20.2 25 25"
                    stroke="url(#docPersonGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-xs sm:text-[13.5px] font-medium text-slate-700 leading-snug">
                Atención cercana
                <br />y profesional
              </p>
            </div>

            {/* Item 2: Enfoque en la salud bucal integral */}
            <div className="flex items-center gap-4 group">
              <div className="shrink-0">
                <svg className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 32 32" fill="none">
                  <defs>
                    <linearGradient id="docToothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="10%" stopColor="#0f2236" />
                      <stop offset="90%" stopColor="#009bb3" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M16 6.5C13.5 5 8.5 5 7 8.5C5.5 12 6 16.5 7.5 20.5C8.8 24 10 28 11.5 28C13 28 13.5 25.5 14 22.5C14.5 20 15.2 19 16 19C16.8 19 17.5 20 18 22.5C18.5 25.5 19 28 20.5 28C22 28 23.2 24 24.5 20.5C26 16.5 26.5 12 25 8.5C23.5 5 18.5 5 16 6.5Z"
                    stroke="url(#docToothGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-xs sm:text-[13.5px] font-medium text-slate-700 leading-snug">
                Enfoque en la
                <br />salud bucal integral
              </p>
            </div>

            {/* Item 3: Comprometida con tu bienestar */}
            <div className="flex items-center gap-4 group">
              <div className="shrink-0">
                <svg className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 32 32" fill="none">
                  <defs>
                    <linearGradient id="docHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="10%" stopColor="#0f2236" />
                      <stop offset="90%" stopColor="#009bb3" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M16 26C16 26 5.5 19.5 5.5 12C5.5 7.8 8.8 5 12.5 5C14.8 5 15.8 6 16 6.8C16.2 6 17.2 5 19.5 5C23.2 5 26.5 7.8 26.5 12C26.5 19.5 16 26 16 26Z"
                    stroke="url(#docHeartGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-xs sm:text-[13.5px] font-medium text-slate-700 leading-snug">
                Comprometida con
                <br />tu bienestar
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
