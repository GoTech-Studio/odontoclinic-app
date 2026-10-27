"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Sun,
  Smile,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
  Activity,
  Heart,
  Baby,
  Scissors,
} from "lucide-react";

interface ServicesGridProps {
  onOpenBooking: () => void;
}

export function ServicesGrid({ onOpenBooking }: ServicesGridProps) {
  const [showAll, setShowAll] = useState(false);

  const primaryServices = [
    {
      title: "Limpieza dental",
      desc: "Mantén tu sonrisa sana y brillante.",
      icon: <Sparkles className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
    {
      title: "Ortodoncia",
      desc: "Alinea tu sonrisa con tecnología actual.",
      icon: <Layers className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
    {
      title: "Blanqueamiento",
      desc: "Recupera el brillo natural de tus dientes.",
      icon: <Sun className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
    {
      title: "Diseño de sonrisa",
      desc: "Una sonrisa que se adapta a ti.",
      icon: <Smile className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
    {
      title: "Implantes dentales",
      desc: "Recupera la funcionalidad y estética de tu sonrisa.",
      icon: <ShieldCheck className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
    {
      title: "Odontología general",
      desc: "Prevención y tratamiento para toda la familia.",
      icon: <Stethoscope className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
  ];

  const additionalServices = [
    {
      title: "Endodoncia",
      desc: "Tratamiento de conducto con tecnología rotatoria indolora.",
      icon: <Activity className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
    {
      title: "Odontopediatría",
      desc: "Atención cálida, divertida y sin miedo para niños.",
      icon: <Baby className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
    {
      title: "Periodoncia",
      desc: "Salud y soporte de encías libre de inflamación y sangrado.",
      icon: <Heart className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
    {
      title: "Bichectomía",
      desc: "Perfilamiento facial armónico y seguro de mejillas.",
      icon: <Scissors className="w-6 h-6 text-teal-600 stroke-[1.75]" />,
    },
  ];

  return (
    <section id="servicios" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Exacto */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mb-2">
            NUESTROS SERVICIOS
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Cuidamos cada detalle de tu sonrisa
          </h2>
        </div>

        {/* Grid de 6 Tarjetas Minimalistas Limpias */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {primaryServices.map((service, index) => (
            <div
              key={index}
              onClick={onOpenBooking}
              className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 text-center flex flex-col items-center justify-start cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50/70 group-hover:bg-teal-100/70 flex items-center justify-center mb-4 transition-colors">
                {service.icon}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5 group-hover:text-teal-700 transition-colors">
                {service.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Especialidades adicionales desplegables */}
        {showAll && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-6 animate-in fade-in duration-300">
            {additionalServices.map((service, index) => (
              <div
                key={index}
                onClick={onOpenBooking}
                className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all text-center flex flex-col items-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50/70 flex items-center justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Botón para ver más / contraer especialidades */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-teal-700 py-1.5 px-4 rounded-full border border-slate-200 hover:border-teal-300 transition-all"
          >
            <span>{showAll ? "Ver menos servicios" : "Ver todas las especialidades (+4)"}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showAll ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
