"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Smile,
  ShieldAlert,
  Baby,
  Sparkle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { WHATSAPP_CLINIC_NUMBER } from "@/config/site-config";

interface TriageOption {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
  recommendedService: string;
  doctorSpecialty: string;
  details: string;
  benefits: string[];
  estimatedTime: string;
  whatsappMessage: string;
}

const triageOptions: TriageOption[] = [
  {
    id: "dolor",
    title: "Tengo dolor o molestia dental",
    shortDesc: "Molestia con frío/calor, punzadas o inflamación de encías",
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    recommendedService: "Urgencias / Endodoncia & Tratamiento de Conducto",
    doctorSpecialty: "Dra. Pamela Claros Flores — Endodoncia & Restauración",
    details:
      "Aliviamos el dolor desde la primera sesión con anestesia computarizada indolora y tecnología rotatoria que preserva tu pieza dental natural.",
    benefits: ["Alivio del dolor inmediato", "Sin dolor durante el procedimiento", "Salvamos tu diente natural"],
    estimatedTime: "1 sesión (45 a 60 min)",
    whatsappMessage: "Hola Odontoclinic Camiri, tengo un dolor o molestia dental y requiero una consulta de urgencia/valoración.",
  },
  {
    id: "estetica",
    title: "Quiero una sonrisa más blanca y estética",
    shortDesc: "Dientes manchados, desgaste, espacios o forma irregular",
    icon: <Sparkles className="w-6 h-6 text-cyan-500" />,
    recommendedService: "Odontología Estética, Carillas & Blanqueamiento",
    doctorSpecialty: "Dra. Pamela Claros Flores — Especialista en Estética Dental",
    details:
      "Diseño digital de sonrisa para lograr dientes blancos, armónicos y naturales. Usamos blanqueamiento láser que no daña tu esmalte ni causa hipersensibilidad.",
    benefits: ["Hasta 4 tonos más blanco en 1 sesión", "Carillas cerámicas ultradelgadas", "Diseño previo digital"],
    estimatedTime: "1 a 2 sesiones",
    whatsappMessage: "Hola Odontoclinic Camiri, me interesa mejorar la estética de mi sonrisa (blanqueamiento o carillas).",
  },
  {
    id: "implantes",
    title: "Me falta una o más piezas dentales",
    shortDesc: "Deseo recuperar mi masticación y la seguridad al sonreír",
    icon: <ShieldAlert className="w-6 h-6 text-blue-500" />,
    recommendedService: "Implantología Dental de Titanio",
    doctorSpecialty: "Cirugía e Implantología Odontoclinic",
    details:
      "Los implantes dentales son raíces artificiales de titanio biocompatible que reemplazan dientes perdidos de manera fija, duradera y con estética idéntica a tus dientes naturales.",
    benefits: ["Comes de todo con total seguridad", "No desgasta los dientes vecinos", "Duran toda la vida"],
    estimatedTime: "Evaluación + Planificación 3D",
    whatsappMessage: "Hola Odontoclinic Camiri, deseo información sobre implantes dentales para recuperar una o más piezas.",
  },
  {
    id: "ortodoncia",
    title: "Dientes apiñados o problemas de mordida",
    shortDesc: "Quiero alinear mis dientes para una mordida perfecta",
    icon: <Smile className="w-6 h-6 text-teal-500" />,
    recommendedService: "Ortodoncia (Brackets Estéticos / Metálicos / Alineadores)",
    doctorSpecialty: "Especialidad en Ortodoncia y Ortopedia Maxilar",
    details:
      "Corrige la posición de tus piezas dentales mejorando la estética de tu rostro y la masticación. Opciones discretas y con fuerzas ligeras para evitar molestias.",
    benefits: ["Mejora estética y perfil facial", "Opciones transparentes/estéticas", "Planes de pago mensuales"],
    estimatedTime: "Control mensual",
    whatsappMessage: "Hola Odontoclinic Camiri, quiero una consulta para iniciar tratamiento de ortodoncia (brackets/alineadores).",
  },
  {
    id: "ninos",
    title: "Atención odontológica para mi hijo/a",
    shortDesc: "Primera consulta, prevención de caries o control dental",
    icon: <Baby className="w-6 h-6 text-pink-500" />,
    recommendedService: "Odontopediatría Integral & Preventiva",
    doctorSpecialty: "Atención Pediátrica Cálida y sin Traumas",
    details:
      "Un entorno lúdico, empático y paciente pensado para que los niños crezcan amando ir al dentista. Sellantes, flúor y prevención sin dolor ni lágrimas.",
    benefits: ["Ambiente divertido y amigable", "Técnicas de manejo de conducta", "Educación bucal en familia"],
    estimatedTime: "30 a 45 min",
    whatsappMessage: "Hola Odontoclinic Camiri, deseo agendar una cita de Odontopediatría para mi hijo/a.",
  },
  {
    id: "bichectomia",
    title: "Deseo afinar y estilizar mi rostro",
    shortDesc: "Reducción de mejillas para resaltar pómulos",
    icon: <Sparkle className="w-6 h-6 text-purple-500" />,
    recommendedService: "Bichectomía Estética Facial",
    doctorSpecialty: "Cirugía Estética Facial Odontoclinic",
    details:
      "Procedimiento quirúrgico menor ambulatorio para retirar las bolsas de Bichat (grasa en las mejillas), logrando un rostro más delgado, definido y juvenil.",
    benefits: ["Procedimiento rápido (40 min)", "Incisiones por dentro de la boca (sin cicatrices)", "Resultados definitivos"],
    estimatedTime: "Procedimiento ambulatorio (40 min)",
    whatsappMessage: "Hola Odontoclinic Camiri, me interesa conocer más sobre el procedimiento de Bichectomía.",
  },
];

export function QuickTriage() {
  const [selectedId, setSelectedId] = useState<string>("dolor");
  const activeTriage = triageOptions.find((t) => t.id === selectedId) || triageOptions[0];

  return (
    <section id="triage" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Luces y auras futuristas de fondo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Orientador Inteligente de Consulta
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            ¿Cuál es el motivo principal de tu visita?
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Selecciona tu caso y descubre al instante el tratamiento recomendado, tiempos y la
            opción de agendar directamente.
          </p>
        </div>

        {/* Grid de Selección Interactiva */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {triageOptions.map((opt) => {
            const isSelected = opt.id === selectedId;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedId(opt.id)}
                className={`p-4 rounded-2xl text-left transition-all duration-300 relative group flex flex-col justify-between border ${
                  isSelected
                    ? "bg-gradient-to-b from-cyan-950/90 to-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                    : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:border-slate-600"
                }`}
              >
                <div className="mb-3 p-2.5 rounded-xl bg-slate-900/60 w-fit border border-slate-700/50 group-hover:scale-110 transition-transform">
                  {opt.icon}
                </div>
                <div>
                  <h3
                    className={`font-bold text-sm leading-snug ${
                      isSelected ? "text-cyan-300" : "text-slate-200"
                    }`}
                  >
                    {opt.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 hidden sm:block">
                    {opt.shortDesc}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Panel Dinámico con Resultado y Detalles */}
        <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 border border-cyan-500/30 relative overflow-hidden transition-all duration-500 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Información del Tratamiento */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-semibold border border-cyan-400/30">
                  Tratamiento Sugerido
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {activeTriage.estimatedTime}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {activeTriage.recommendedService}
              </h3>

              <p className="text-sm font-medium text-cyan-200">
                Atendido por: {activeTriage.doctorSpecialty}
              </p>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {activeTriage.details}
              </p>

              {/* Beneficios Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {activeTriage.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60 text-xs text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Directo hacia WhatsApp / Agendamiento */}
            <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-end text-center lg:text-right border-t lg:border-t-0 lg:border-l border-slate-700/80 pt-6 lg:pt-0 lg:pl-8">
              <div className="w-full max-w-xs space-y-3">
                <p className="text-xs text-slate-400">
                  ¿Quieres resolver dudas directamente con nosotros?
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_CLINIC_NUMBER}?text=${encodeURIComponent(
                    activeTriage.whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 transition-all transform active:scale-95 group"
                >
                  <Phone className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
                  <span>Consultar por WhatsApp</span>
                  <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform" />
                </a>
                <span className="text-[11px] text-slate-500 block">
                  Respuesta rápida durante horario de atención
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
