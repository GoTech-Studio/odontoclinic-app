"use client";

import React from "react";
import { CLINIC_SERVICES } from "@/config/site-config";
import { ServiceIconType } from "@/types/domain";

interface ServicesSectionProps {
  onOpenBooking: (service?: string) => void;
}

function renderServiceIcon(icon: ServiceIconType) {
  switch (icon) {
    case "cleaning":
      return (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="srvGrad_cleaning" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="10%" stopColor="#0f2236" />
              <stop offset="90%" stopColor="#009bb3" />
            </linearGradient>
          </defs>
          <path
            d="M16 6.5C13.5 5 8.5 5 7 8.5C5.5 12 6 16.5 7.5 20.5C8.8 24 10 28 11.5 28C13 28 13.5 25.5 14 22.5C14.5 20 15.2 19 16 19C16.8 19 17.5 20 18 22.5C18.5 25.5 19 28 20.5 28C22 28 23.2 24 24.5 20.5C26 16.5 26.5 12 25 8.5C23.5 5 18.5 5 16 6.5Z"
            stroke="url(#srvGrad_cleaning)"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cleaning shine bubble / droplet */}
          <circle
            cx="21.5"
            cy="11.5"
            r="1.8"
            stroke="url(#srvGrad_cleaning)"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "orthodontics":
      return (
        <svg className="w-10 h-9" viewBox="0 0 36 32" fill="none">
          <defs>
            <linearGradient id="srvGrad_ortho" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="10%" stopColor="#0f2236" />
              <stop offset="90%" stopColor="#009bb3" />
            </linearGradient>
          </defs>
          {/* Left Incisor */}
          <path
            d="M9.5 7C12 7 14.5 8 16 10C16 15 16 21 16 26.5C16 27.5 14.5 28 13.5 28C11.5 28 9.5 26.5 8.5 24C7 20.5 7 15 7 10C7 8 8 7 9.5 7Z"
            stroke="url(#srvGrad_ortho)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Incisor */}
          <path
            d="M26.5 7C24 7 21.5 8 20 10C20 15 20 21 20 26.5C20 27.5 21.5 28 22.5 28C24.5 28 26.5 26.5 27.5 24C29 20.5 29 15 29 10C29 8 28 7 26.5 7Z"
            stroke="url(#srvGrad_ortho)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Horizontal Archwire */}
          <path
            d="M4 17.5H32"
            stroke="url(#srvGrad_ortho)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Left Aesthetic Bracket */}
          <rect
            x="9.5"
            y="14.5"
            width="5"
            height="6"
            rx="1"
            stroke="url(#srvGrad_ortho)"
            strokeWidth="1.6"
            fill="#f0f7f9"
          />
          <line
            x1="12"
            y1="13.5"
            x2="12"
            y2="21.5"
            stroke="url(#srvGrad_ortho)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Right Aesthetic Bracket */}
          <rect
            x="21.5"
            y="14.5"
            width="5"
            height="6"
            rx="1"
            stroke="url(#srvGrad_ortho)"
            strokeWidth="1.6"
            fill="#f0f7f9"
          />
          <line
            x1="24"
            y1="13.5"
            x2="24"
            y2="21.5"
            stroke="url(#srvGrad_ortho)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "whitening":
      return (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="srvGrad_whitening" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="10%" stopColor="#0f2236" />
              <stop offset="90%" stopColor="#009bb3" />
            </linearGradient>
          </defs>
          <path
            d="M16 6.5C13.5 5 8.5 5 7 8.5C5.5 12 6 16.5 7.5 20.5C8.8 24 10 28 11.5 28C13 28 13.5 25.5 14 22.5C14.5 20 15.2 19 16 19C16.8 19 17.5 20 18 22.5C18.5 25.5 19 28 20.5 28C22 28 23.2 24 24.5 20.5C26 16.5 26.5 12 25 8.5C23.5 5 18.5 5 16 6.5Z"
            stroke="url(#srvGrad_whitening)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Primary 4-Point Sparkle Star */}
          <path
            d="M24.5 2.5C24.5 5 25.5 6 28 6C25.5 6 24.5 7 24.5 9.5C24.5 7 23.5 6 21 6C23.5 6 24.5 5 24.5 2.5Z"
            fill="url(#srvGrad_whitening)"
          />
          {/* Secondary Sparkle Star */}
          <path
            d="M28.5 12C28.5 13.3 29.2 14 30.5 14C29.2 14 28.5 14.7 28.5 16C28.5 14.7 27.8 14 26.5 14C27.8 14 28.5 13.3 28.5 12Z"
            fill="url(#srvGrad_whitening)"
          />
        </svg>
      );
    case "smile_design":
      return (
        <svg className="w-10 h-8" viewBox="0 0 36 28" fill="none">
          <defs>
            <linearGradient id="srvGrad_smile" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="10%" stopColor="#0f2236" />
              <stop offset="90%" stopColor="#009bb3" />
            </linearGradient>
          </defs>
          {/* Upper Lip Smile Line */}
          <path
            d="M6 10C10 13.5 14 14.5 18 14.5C22 14.5 26 13.5 30 10"
            stroke="url(#srvGrad_smile)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Lower Smile Arc */}
          <path
            d="M4.5 8.5C8 17 12.5 22 18 22C23.5 22 28 17 31.5 8.5"
            stroke="url(#srvGrad_smile)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Central Aesthetic Sparkle */}
          <path
            d="M18 4C18 5.2 18.5 5.8 19.8 5.8C18.5 5.8 18 6.4 18 7.6C18 6.4 17.5 5.8 16.2 5.8C17.5 5.8 18 5.2 18 4Z"
            fill="url(#srvGrad_smile)"
          />
        </svg>
      );
    case "implants":
      return (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="srvGrad_implants" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="10%" stopColor="#0f2236" />
              <stop offset="90%" stopColor="#009bb3" />
            </linearGradient>
          </defs>
          {/* Anatomical Crown */}
          <path
            d="M16 6C13.5 4.5 8.5 4.5 7 7.5C5.5 10.5 6 14.5 7.5 17.5C9 19.5 11.5 20.2 16 20.2C20.5 20.2 23 19.5 24.5 17.5C26 14.5 26.5 10.5 25 7.5C23.5 4.5 18.5 4.5 16 6Z"
            stroke="url(#srvGrad_implants)"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Titanium Implant Screw Ridges */}
          <path
            d="M11 20.2H21M11.5 23.2H20.5M12.5 26.2H19.5M14 29.2H18"
            stroke="url(#srvGrad_implants)"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      );
    case "root_canal":
      return (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="srvGrad_root" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="10%" stopColor="#0f2236" />
              <stop offset="90%" stopColor="#009bb3" />
            </linearGradient>
          </defs>
          <path
            d="M16 6.5C13.5 5 8.5 5 7 8.5C5.5 12 6 16.5 7.5 20.5C8.8 24 10 28 11.5 28C13 28 13.5 25.5 14 22.5C14.5 20 15.2 19 16 19C16.8 19 17.5 20 18 22.5C18.5 25.5 19 28 20.5 28C22 28 23.2 24 24.5 20.5C26 16.5 26.5 12 25 8.5C23.5 5 18.5 5 16 6.5Z"
            stroke="url(#srvGrad_root)"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 13.5C13 17 12 21 11.5 24.5M19 13.5C19 17 20 21 20.5 24.5M16 12V18"
            stroke="url(#srvGrad_root)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "surgery":
      return (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="srvGrad_surgery" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="10%" stopColor="#0f2236" />
              <stop offset="90%" stopColor="#009bb3" />
            </linearGradient>
          </defs>
          <path
            d="M16 4.5L25 8.5V16C25 21.5 21 25.5 16 27.5C11 25.5 7 21.5 7 16V8.5L16 4.5Z"
            stroke="url(#srvGrad_surgery)"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 11.5V20.5M11.5 16H20.5"
            stroke="url(#srvGrad_surgery)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "general":
    default:
      return (
        <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="srvGrad_general" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="10%" stopColor="#0f2236" />
              <stop offset="90%" stopColor="#009bb3" />
            </linearGradient>
          </defs>
          <path
            d="M16 6.5C13.5 5 8.5 5 7 8.5C5.5 12 6 16.5 7.5 20.5C8.8 24 10 28 11.5 28C13 28 13.5 25.5 14 22.5C14.5 20 15.2 19 16 19C16.8 19 17.5 20 18 22.5C18.5 25.5 19 28 20.5 28C22 28 23.2 24 24.5 20.5C26 16.5 26.5 12 25 8.5C23.5 5 18.5 5 16 6.5Z"
            stroke="url(#srvGrad_general)"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Cusp Grooves */}
          <path
            d="M16 9.5V14.5M13.5 12C15 12.5 17 12.5 18.5 12"
            stroke="url(#srvGrad_general)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function ServicesSection({ onOpenBooking }: ServicesSectionProps) {
  const activeServices = CLINIC_SERVICES.filter((srv) => srv.enabled);

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-white" id="servicios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Services Section Left Header */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#007485] uppercase mb-3">
              NUESTROS SERVICIOS
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight mb-4">
              Cuidamos cada detalle<br />de tu sonrisa
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
              Una atención integral y personalizada para devolverle la salud y confianza a tu boca. Combinamos experiencia, tecnología y un trato cercano pensado en tu bienestar.
            </p>
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="btn-pill-outline inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer"
            >
              <span>Conoce todos los servicios</span>
              <span>→</span>
            </button>
          </div>

          {/* Services Grid (Driven by CLINIC_SERVICES registry) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {activeServices.map((service) => (
              <div
                key={service.id}
                onClick={() => onOpenBooking(service.title)}
                className="relative bg-[#f2f8fa] hover:bg-white rounded-[16px] sm:rounded-[24px] p-4 sm:p-7 text-center transition-all duration-300 hover:shadow-xl hover:shadow-[#009bb3]/10 hover:-translate-y-1.5 hover:border-[#009bb3]/30 border border-transparent group cursor-pointer select-none flex flex-col items-center justify-center"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3.5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  {renderServiceIcon(service.icon)}
                </div>
                <h3 className="text-xs sm:text-[13.5px] font-semibold text-slate-800 tracking-tight transition-colors group-hover:text-[#007485] leading-tight">
                  {service.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
