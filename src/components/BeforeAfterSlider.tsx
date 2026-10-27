"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, ArrowLeftRight, Check, Award } from "lucide-react";

export function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <section id="casos" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 text-cyan-900 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            Casos Clínicos Reales
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Resultados que Devuelven la <span className="text-cyan-600">Confianza</span>
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            Desliza el comparador interactivo para ver el cambio estético antes y después de
            nuestros tratamientos de odontología estética y blanqueamiento en OdontoClinic.
          </p>
        </div>

        {/* Comparador Interactivo */}
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/15 border-4 border-white select-none bg-slate-900">
            {/* Imagen DESPUÉS (Fondo base) */}
            <div className="absolute inset-0">
              <Image
                src="/images/smile_result.jpg"
                alt="Sonrisa Después del Tratamiento - OdontoClinic Camiri"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
              <div className="absolute top-4 right-4 bg-emerald-500/90 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm z-10 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Después (Resultado Final)</span>
              </div>
            </div>

            {/* Imagen ANTES (Superpuesta con filtro y recorte clip-path) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
            >
              <Image
                src="/images/smile_result.jpg"
                alt="Sonrisa Antes del Tratamiento"
                fill
                className="object-cover filter sepia-[0.35] brightness-[0.88] contrast-[0.95]"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm z-10">
                Antes (Estado Inicial)
              </div>
            </div>

            {/* Línea divisoria vertical interactiva */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none z-20"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Botón flotante central de arrastre */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-cyan-500 text-white shadow-xl flex items-center justify-center border-2 border-white pointer-events-none">
                <ArrowLeftRight className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            {/* Input Range transparente que cubre todo el contenedor para interacción táctil o mouse */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
              aria-label="Deslizar comparador antes y después"
            />
          </div>

          {/* Instrucción sutil de interacción */}
          <div className="text-center mt-3 text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-500" />
            <span>Haz clic o arrastra sobre la imagen para comparar el cambio</span>
          </div>

          {/* Ficha técnica del caso clínico */}
          <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Tratamiento Aplicado</span>
                <span className="text-sm font-bold text-slate-900">
                  Blanqueamiento Láser + Microestética
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Tiempo de Realización</span>
                <span className="text-sm font-bold text-slate-900">
                  2 Sesiones de 45 minutos
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Esmalte Protegido</span>
                <span className="text-sm font-bold text-slate-900">
                  100% Sin Desgaste / 0% Dolor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
