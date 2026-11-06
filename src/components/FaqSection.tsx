"use client";

import React, { useState } from "react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: "¿Cómo puedo agendar una cita?",
      a: "Puedes solicitar tu consulta fácilmente haciendo clic en el botón 'Solicitar cita' en esta web para coordinar tu día y horario por WhatsApp.",
    },
    {
      q: "¿Qué servicios ofrece la clínica?",
      a: "Ofrecemos limpieza profunda, restauraciones estéticas, tratamiento de conducto, prótesis fija y removible, implantes dentales y cirugías de alta complejidad.",
    },
    {
      q: "¿Dónde está ubicada la clínica?",
      a: "Estamos ubicados en la calle 24 de Septiembre, esquina con la calle Colón, en Camiri, Bolivia. Puedes orientarte directamente con el mapa embebido en esta página o tocar “Cómo llegar” para abrir la ruta en Google Maps.",
    },
  ];

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-white" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Header */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#007485] uppercase">
              PREGUNTAS FRECUENTES
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              ¿Tienes dudas?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-sm">
              Aquí respondemos las preguntas más comunes sobre nuestros servicios, citas y
              ubicación.
            </p>
          </div>

          {/* Right Accordion List with Smooth Animated Expansion */}
          <div className="lg:col-span-7 divide-y divide-slate-100 border-t border-b border-slate-100">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="py-4.5 px-3 -mx-3 rounded-2xl transition-colors duration-200 hover:bg-slate-50/70"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full flex justify-between items-center text-left font-medium select-none cursor-pointer group"
                  >
                    <span
                      className={`text-sm sm:text-base transition-colors duration-200 ${
                        isOpen
                          ? "text-[#007485] font-semibold"
                          : "text-slate-900 group-hover:text-[#007485]"
                      }`}
                    >
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 shrink-0 ml-3 flex items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "bg-[#009bb3] text-white rotate-45 shadow-sm"
                          : "bg-[#ebf4f7] text-[#007485] rotate-0 group-hover:bg-[#009bb3]/20"
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.4]"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 5v14M5 12h14"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {/* Smooth height expansion container */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 mt-2.5"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pr-8 pb-1">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
