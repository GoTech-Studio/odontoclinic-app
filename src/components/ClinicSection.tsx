"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteImages } from "@/lib/hooks/use-site-images";

export function ClinicSection() {
  const siteImages = useSiteImages();
  const clinicImages = [
    siteImages.clinic_1,
    siteImages.clinic_2,
    siteImages.clinic_3,
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? clinicImages.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === clinicImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStart(null);
  };

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-white" id="clinica">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text block left */}
          <div className="lg:col-span-4 space-y-4 pr-0 lg:pr-6">
            <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#007485] uppercase">
              LA CLÍNICA
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Un espacio pensado
              <br />
              para tu comodidad
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Contamos con un ambiente moderno, seguro y equipado con tecnología de última generación
              para brindarte la mejor experiencia.
            </p>
            <div className="pt-2">
              <a
                className="btn-pill-outline inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                href="#contacto"
              >
                <span>Conoce nuestras instalaciones</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Mobile Carousel (sm:hidden) */}
          <div className="block sm:hidden lg:col-span-8">
            <div
              className="relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm aspect-[4/5] bg-slate-100 touch-pan-y select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {clinicImages.map((img, index) => (
                <div
                  key={img.slot}
                  className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    alt={img.alt}
                    src={img.src}
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className="object-cover"
                     quality={85}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-900/70 via-slate-900/25 to-transparent pointer-events-none">
                    <span className="text-sm font-semibold text-white drop-shadow-sm">
                      {img.label}
                    </span>
                  </div>
                </div>
              ))}

              {/* Prev / Next buttons over mobile image */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-800 hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 -ml-0.5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Siguiente foto"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-800 hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 -mr-0.5" />
              </button>
            </div>

            {/* Carousel navigation dots */}
            <div className="flex items-center justify-center gap-2 mt-3.5">
              {clinicImages.map((img, index) => (
                <button
                  key={img.slot}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Ver foto ${index + 1}: ${img.label || img.alt}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide
                      ? "w-7 bg-[#009bb3]"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop 3 Gallery Images (hidden sm:grid) */}
          <div className="hidden sm:grid lg:col-span-8 sm:grid-cols-3 gap-4">
            {clinicImages.map((img) => (
              <div
                key={img.slot}
                className="relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm aspect-[4/5] bg-slate-100 group"
              >
                <Image
                  alt={img.alt}
                  src={img.src}
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                   quality={85}
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent pointer-events-none">
                  <span className="text-xs font-semibold text-white drop-shadow-sm">
                    {img.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
