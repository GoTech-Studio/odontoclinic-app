"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Plus,
  Minus,
  ArrowRight,
  Navigation,
} from "lucide-react";

interface LocationAndFaqProps {
  onOpenBooking: () => void;
}

export function LocationAndFaq({ onOpenBooking }: LocationAndFaqProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Cómo puedo agendar una cita?",
      a: "Puedes agendar fácilmente haciendo clic en el botón 'Solicitar cita' en esta web o enviándonos un mensaje directo a nuestro WhatsApp. Te responderemos a la brevedad para coordinar el mejor horario.",
    },
    {
      q: "¿Qué servicios ofrecen?",
      a: "Ofrecemos atención integral: Limpieza dental por ultrasonido, Ortodoncia (brackets y alineadores), Blanqueamiento dental láser, Diseño de sonrisa, Implantes de titanio, Endodoncia sin dolor, Odontopediatría y Bichectomía facial.",
    },
    {
      q: "¿En qué horario atienden?",
      a: "Atendemos de Lunes a Viernes de 08:30 a 12:30 y de 14:30 a 19:30. Los días Sábados atendemos de 08:30 a 12:30 y de 14:30 a 18:30. Domingos con previa coordinación para urgencias.",
    },
    {
      q: "¿Dónde están ubicados?",
      a: "Nuestra clínica se encuentra en la zona central de Camiri, Santa Cruz, Bolivia. Contamos con instalaciones climatizadas y de fácil acceso.",
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section id="ubicacion" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LADO IZQUIERDO: Tarjeta Oscura de Ubicación con Mapa Integrado */}
          <div className="lg:col-span-6 bg-[#0a192f] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-teal-400 uppercase mb-2">
                UBICACIÓN
              </p>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Camiri, Bolivia
              </h3>

              <p className="text-sm text-slate-300 mt-2 mb-6">
                Estamos aquí para atenderte. Contáctanos y agenda tu cita.
              </p>

              {/* 3 Datos de contacto con íconos circulares */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Camiri, Bolivia</span>
                    <span className="text-xs text-slate-400">
                      (Dirección exacta por confirmar)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">WhatsApp</span>
                    <span className="text-xs text-slate-400">
                      (Número oficial por confirmar)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Horario de atención
                    </span>
                    <span className="text-xs text-slate-400">
                      (Lun a Sáb: Mañana y Tarde)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa Ilustrado Integrado exactamente como en la referencia */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-700/60 flex items-center justify-center p-4">
              {/* Calles vectoriales sutiles de fondo */}
              <svg
                className="absolute inset-0 w-full h-full opacity-35 stroke-slate-300"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="0" y1="80" x2="600" y2="80" strokeWidth="6" />
                <line x1="0" y1="180" x2="600" y2="180" strokeWidth="10" />
                <line x1="140" y1="0" x2="140" y2="400" strokeWidth="6" />
                <line x1="340" y1="0" x2="340" y2="400" strokeWidth="10" />
                <line x1="0" y1="20" x2="600" y2="350" strokeWidth="4" strokeDasharray="4 4" />
              </svg>

              {/* Pin central con badge Odontoclinic */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] shadow-lg flex items-center gap-1.5 border border-teal-500">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Odontoclinic</span>
                </div>
                <div className="w-3 h-3 bg-slate-900 rotate-45 -mt-1.5 border-r border-b border-teal-500" />
                <div className="w-4 h-4 rounded-full bg-teal-500 ring-4 ring-white/90 shadow-md mt-0.5" />
              </div>

              {/* Botón flotante sutil para Google Maps */}
              <a
                href="https://maps.app.goo.gl/kiwcaM64fnRZbRDY6"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 text-[11px] font-semibold text-slate-700 bg-white/90 hover:bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1 transition-colors"
              >
                <Navigation className="w-3 h-3 text-teal-600" />
                <span>Abrir mapa</span>
              </a>
            </div>
          </div>

          {/* LADO DERECHO: Sección de Preguntas Frecuentes (FAQ) */}
          <div id="faq" className="lg:col-span-6 space-y-6 pt-2">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                ¿Tienes alguna duda?
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Aquí respondemos las preguntas más comunes sobre nuestros servicios, citas y
                ubicación.
              </p>
            </div>

            {/* Lista Acordeón FAQ */}
            <div className="space-y-3 pt-2">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border-b border-slate-100 pb-3 transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left py-2 text-sm sm:text-base font-semibold text-slate-800 hover:text-teal-700 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="p-1 rounded-full text-slate-400 hover:text-teal-600">
                        {isOpen ? (
                          <Minus className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Plus className="w-4 h-4 text-[#009bb3]" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1 pb-2 animate-in fade-in duration-200">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón "Ver todas las preguntas" o "Contactar por WhatsApp" */}
            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-teal-600 text-teal-700 hover:bg-teal-50 text-sm font-semibold transition-all duration-200 group"
              >
                <span>Ver todas las preguntas</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
