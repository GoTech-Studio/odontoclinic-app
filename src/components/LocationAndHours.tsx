"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { WHATSAPP_CLINIC_NUMBER } from "@/config/site-config";

export function LocationAndHours() {
  const [isOpenNow, setIsOpenNow] = useState<boolean>(true);

  // Comprobar estado de horario en hora local
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const day = now.getDay(); // 0 domingo, 1-6 lunes a sabado
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hour + minutes / 60;

      if (day === 0) {
        // Domingo cerrado
        setIsOpenNow(false);
      } else {
        // Lun a Sab: 8:30 a 12:30 y 14:30 a 19:30
        const isMorning = currentTime >= 8.5 && currentTime < 12.5;
        const isAfternoon = currentTime >= 14.5 && currentTime < 19.5;
        setIsOpenNow(isMorning || isAfternoon);
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, []);

  const scheduleDays = [
    { day: "Lunes a Viernes", morning: "08:30 – 12:30", afternoon: "14:30 – 19:30", active: true },
    { day: "Sábados", morning: "08:30 – 12:30", afternoon: "14:30 – 18:30", active: true },
    { day: "Domingos & Feriados", morning: "Cerrado", afternoon: "Urgencias coordinadas", active: false },
  ];

  return (
    <section id="ubicacion" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 text-cyan-900 text-xs font-semibold uppercase tracking-wider mb-4">
            <MapPin className="w-3.5 h-3.5 text-cyan-600" />
            En el Corazón de Camiri
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Ubicación y <span className="text-cyan-600">Horarios de Atención</span>
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            Visítanos en nuestras confortables instalaciones en Camiri o escríbenos directamente
            para coordinar tu espacio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Tarjeta de Horarios y Contacto (5 columnas) */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Badge de Estado en Tiempo Real */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Estado de la Clínica
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                    isOpenNow
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOpenNow ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {isOpenNow ? "Abierto Ahora" : "Cerrado por ahora"}
                </span>
              </div>

              {/* Lista de Horarios */}
              <div className="py-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horarios de Consulta
                </h3>

                <div className="space-y-3">
                  {scheduleDays.map((sched, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-1.5"
                    >
                      <span className="font-semibold text-slate-200">{sched.day}</span>
                      <div className="text-slate-400 text-right sm:text-right font-medium">
                        <span>{sched.morning}</span>
                        {sched.afternoon && (
                          <span className="block text-cyan-300">{sched.afternoon}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Datos de contacto directo */}
              <div className="pt-4 border-t border-slate-800 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Camiri, Santa Cruz — Bolivia (Zona Central)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>+591 7890-0000 / Consultorio Odontoclinic</span>
                </div>
              </div>
            </div>

            {/* Botón WhatsApp */}
            <div className="pt-6">
              <a
                href={`https://wa.me/${WHATSAPP_CLINIC_NUMBER}?text=Hola%20Odontoclinic%20Camiri,%20deseo%20saber%20la%20direcci%C3%B3n%20exacta%20y%20agendar`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pedir Ubicación por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Mapa Visual / Tarjeta de Orientación (7 columnas) */}
          <div className="lg:col-span-7 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative min-h-[380px] flex flex-col">
            {/* Cabecera del Mapa */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-600 ml-2">
                  Ubicación Odontoclinic Camiri
                </span>
              </div>
              <a
                href="https://maps.app.goo.gl/woSVLJSsF8kS31Za7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Abrir en Google Maps</span>
              </a>
            </div>

            {/* Simulación Gráfica Estilizada de Mapa de Camiri con Pin Interactivo */}
            <div className="relative flex-1 bg-gradient-to-br from-cyan-50 via-slate-100 to-blue-50 flex items-center justify-center p-8 overflow-hidden">
              {/* Calles simuladas en SVG */}
              <svg
                className="absolute inset-0 w-full h-full opacity-30 stroke-slate-300"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="0" y1="120" x2="1000" y2="120" strokeWidth="8" />
                <line x1="0" y1="280" x2="1000" y2="280" strokeWidth="12" />
                <line x1="220" y1="0" x2="220" y2="600" strokeWidth="8" />
                <line x1="520" y1="0" x2="520" y2="600" strokeWidth="12" />
                <line x1="0" y1="0" x2="1000" y2="600" strokeWidth="4" strokeDasharray="6 6" />
              </svg>

              {/* Pin Odontoclinic */}
              <div className="relative z-10 flex flex-col items-center animate-bounce">
                <div className="px-4 py-2 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Odontoclinic Camiri</span>
                </div>
                <div className="w-4 h-4 bg-slate-900 rotate-45 -mt-2 border-r border-b border-cyan-400" />
                <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-cyan-600 ring-4 ring-white shadow-md" />
                </div>
              </div>

              {/* Tarjeta flotante con facilidades */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>Fácil acceso y estacionamiento en los alrededores</span>
                </div>
                <p className="text-slate-500">
                  Ambiente climatizado, sala de espera cómoda y wifi para pacientes y acompañantes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
