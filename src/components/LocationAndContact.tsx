"use client";

import React, { useEffect, useState } from "react";
import { Clock, MapPin, MessageCircle, ArrowUpRight } from "lucide-react";

interface LocationAndContactProps {
  onOpenBooking: () => void;
}

interface ClinicScheduleStatus {
  isOpen: boolean;
  statusText: string;
}

function getBoliviaScheduleStatus(): ClinicScheduleStatus {
  try {
    // Obtener la fecha/hora actual en la zona horaria de Bolivia (America/La_Paz, UTC-4)
    const boliviaDateStr = new Date().toLocaleString("en-US", {
      timeZone: "America/La_Paz",
    });
    const boliviaDate = new Date(boliviaDateStr);
    const day = boliviaDate.getDay(); // 0: Domingo, 1: Lunes, ..., 5: Viernes, 6: Sábado
    const hour = boliviaDate.getHours();
    const minute = boliviaDate.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const OPEN_MINUTES = 9 * 60; // 9:00 AM
    const CLOSE_WEEKDAY_MINUTES = 17 * 60; // 5:00 PM (17:00)
    const CLOSE_SATURDAY_MINUTES = 12 * 60; // 12:00 PM (12:00)

    const isWeekday = day >= 1 && day <= 5;
    const isSaturday = day === 6;

    if (isWeekday) {
      if (timeInMinutes >= OPEN_MINUTES && timeInMinutes < CLOSE_WEEKDAY_MINUTES) {
        return {
          isOpen: true,
          statusText: "Abierto ahora",
        };
      }
      if (timeInMinutes < OPEN_MINUTES) {
        return {
          isOpen: false,
          statusText: "Abre hoy a las 9:00 AM",
        };
      }
      return {
        isOpen: false,
        statusText:
          day === 5
            ? "Abre el sábado a las 9:00 AM"
            : "Abre mañana a las 9:00 AM",
      };
    }

    if (isSaturday) {
      if (timeInMinutes >= OPEN_MINUTES && timeInMinutes < CLOSE_SATURDAY_MINUTES) {
        return {
          isOpen: true,
          statusText: "Abierto ahora",
        };
      }
      if (timeInMinutes < OPEN_MINUTES) {
        return {
          isOpen: false,
          statusText: "Abre hoy a las 9:00 AM",
        };
      }
      return {
        isOpen: false,
        statusText: "Abre el lunes a las 9:00 AM",
      };
    }

    // Domingo (day === 0)
    return {
      isOpen: false,
      statusText: "Abre mañana a las 9:00 AM",
    };
  } catch {
    return {
      isOpen: true,
      statusText: "Horario continuo",
    };
  }
}

export function LocationAndContact({ onOpenBooking }: LocationAndContactProps) {
  const [scheduleStatus, setScheduleStatus] = useState<ClinicScheduleStatus>({
    isOpen: true,
    statusText: "Abierto ahora",
  });

  useEffect(() => {
    setScheduleStatus(getBoliviaScheduleStatus());
    // Actualizar estado cada 60 segundos
    const interval = setInterval(() => {
      setScheduleStatus(getBoliviaScheduleStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-[#f8fafc] border-t border-slate-200/70" id="ubicacion">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Mapa Interactivo con Google Maps (Izquierda) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md h-72 sm:h-80 lg:h-[350px] bg-slate-100 group">
              {/* Google Maps Embed Iframe con las coordenadas exactas de Camiri */}
              <iframe
                title="Ubicación de Odontoclinic en Google Maps"
                src="https://maps.google.com/maps?q=-20.042362,-63.524009&hl=es&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />

              {/* Badge Flotante Superior Izquierdo: Odontoclinic */}
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-slate-200/80 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#009bb3] animate-pulse" />
                  <span className="text-xs font-semibold text-slate-800 tracking-tight">Odontoclinic • Camiri</span>
                </div>
              </div>

              {/* Botón Flotante Superior Derecho: Abrir en Google Maps */}
              <div className="absolute top-3 right-3 z-10">
                <a
                  href="https://maps.app.goo.gl/kiwcaM64fnRZbRDY6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#0f2236]/95 hover:bg-[#009bb3] text-white text-xs font-medium px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Cómo llegar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Location Details (Middle) */}
          <div className="lg:col-span-4 space-y-4 lg:pl-4">
            <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#007485] uppercase">
              UBICACIÓN
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
              Estamos en Camiri,
              <br />
              Bolivia
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Estamos ubicados en la calle 24 de Septiembre, esquina con la calle Colón. Usa el
              mapa de esta página para ubicarte fácilmente o pulsa “Cómo llegar” para abrir la ruta.
            </p>
            <div className="pt-2">
              <a
                className="btn-pill-outline inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                href="https://maps.app.goo.gl/kiwcaM64fnRZbRDY6"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>Ver en Google Maps</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Contact & Dynamic Schedule Details (Right) */}
          <div
            className="lg:col-span-3 space-y-3.5 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-200"
            id="contacto"
          >
            <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#007485] uppercase">
              ATENCIÓN & CONTACTO
            </p>

            {/* Tarjeta Visual Destacada: Horario de Atención */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3 transition-all hover:border-[#009bb3]/40 hover:shadow-md">
              {/* Header de la Tarjeta con Status en Vivo */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#ebf4f7] text-[#007485] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                    Horario de Atención
                  </span>
                </div>

                {/* Badge Dinámico en Vivo */}
                {scheduleStatus.isOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Abierto
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Cerrado
                  </span>
                )}
              </div>

              {/* Filas de Horario Desglosado con Alto Contraste */}
              <div className="space-y-2.5 text-xs sm:text-sm">
                {/* Lunes a Viernes */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-800 block">Lunes a Viernes</span>
                    <span className="text-[10px] sm:text-xs text-[#007485] font-medium block">Horario continuo</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-[#007485] bg-[#ebf4f7] px-2.5 py-1 rounded-lg border border-[#009bb3]/20 shrink-0 tracking-tight">
                    9:00 AM – 5:00 PM
                  </span>
                </div>

                {/* Sábado */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80">
                  <div>
                    <span className="font-semibold text-slate-800 block">Sábados</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-[#007485] bg-[#ebf4f7] px-2.5 py-1 rounded-lg border border-[#009bb3]/20 shrink-0 tracking-tight">
                    9:00 AM – 12:00 PM
                  </span>
                </div>

                {/* Domingo */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80">
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500">Domingos y feriados</span>
                   <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Cerrado
                  </span>
                </div>
              </div>

              {/* Subtexto explicativo del estado */}
              {!scheduleStatus.isOpen && (
                <div className="pt-1 border-t border-slate-100/70 text-[10px] text-slate-500 font-medium">
                  {scheduleStatus.statusText}
                </div>
              )}
            </div>

            {/* Botón Destacado de WhatsApp */}
            <button
              onClick={() => onOpenBooking()}
              type="button"
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#ebf4f7]/50 border border-slate-200/90 hover:border-[#009bb3]/50 shadow-2xs hover:shadow-sm transition-all group cursor-pointer text-left"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-4 h-4 fill-emerald-600/20 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                   <span className="text-xs sm:text-sm font-semibold text-slate-800 block leading-tight group-hover:text-[#007485] transition-colors">
                     Agendar por WhatsApp
                   </span>
                   <span className="text-[10px] sm:text-xs text-slate-500 block leading-tight">
                     Respuesta rápida para consultas y citas
                   </span>
                </div>
              </div>
                <span className="w-5 shrink-0 text-center text-slate-400 group-hover:text-[#007485] group-hover:translate-x-0.5 transition-all text-xs">
                →
              </span>
            </button>

            {/* Dirección Física con Enlace a Maps */}
            <a
              href="https://maps.app.goo.gl/kiwcaM64fnRZbRDY6"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#009bb3]/40 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#ebf4f7] text-slate-600 group-hover:text-[#007485] flex items-center justify-center shrink-0 transition-colors">
                <MapPin className="w-4 h-4 stroke-[2.2]" />
              </div>
               <div className="min-w-0 flex-1">
                 <span className="text-xs sm:text-sm font-semibold text-slate-800 block leading-tight group-hover:text-[#007485] transition-colors">
                   24 de Septiembre esquina Colón
                 </span>
                 <span className="text-[10px] sm:text-xs text-slate-500 block leading-tight">
                   Camiri, Bolivia • Ver en el mapa
                 </span>
               </div>
               <span className="w-5 shrink-0 text-center text-slate-400 group-hover:text-[#007485] group-hover:translate-x-0.5 transition-all text-xs">
                 →
               </span>
             </a>
          </div>
        </div>
      </div>
    </section>
  );
}
