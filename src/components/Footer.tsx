"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  onOpenBooking: () => void;
}

export function Footer({ onOpenBooking }: FooterProps) {
  return (
    <footer className="-mb-px bg-[#0a1826] text-slate-300 pt-7 pb-20 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          {/* Footer Logo */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/logo-footer.svg"
              alt="Odontoclinic"
              width={32}
              height={32}
              className="object-contain w-auto h-7 sm:h-8"
              quality={85}
            />
            <span className="text-lg font-bold tracking-tight text-white">
              Odontoclinic
            </span>
          </div>

          {/* Center Motivating Slogan & Location */}
          <div className="text-xs text-slate-300 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <span>Tu sonrisa, nuestra mayor motivación.</span>
            <span>Camiri, Bolivia</span>
          </div>

          {/* Footer CTA Button */}
          <div>
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="inline-flex items-center gap-2 bg-[#13273d] hover:bg-[#1a3450] text-white text-xs font-medium px-4 py-2 rounded-full border border-[#223f5e] transition-colors cursor-pointer"
            >
              {/* Mini WhatsApp icon */}
              <svg className="w-3.5 h-3.5 fill-current text-[#0ed5dc]" viewBox="0 0 24 24">
                <path d="M12.031 2C6.516 2 2.023 6.49 2.023 12.003c0 1.83.493 3.555 1.353 5.048L2 22l5.093-1.336a9.94 9.94 0 0 0 4.938 1.341c5.513 0 10.007-4.49 10.007-10.002C22.038 6.49 17.545 2 12.031 2z" />
              </svg>
              <span>Agendar una cita</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Copyright & Subtle Developer Credit with symmetrical safe margins */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 text-center sm:text-left sm:px-16">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <p>© 2026 Odontoclinic. Todos los derechos reservados.</p>
            <span className="text-slate-600">•</span>
            <Link
              href="/login"
              className="text-slate-400 hover:text-[#0ed5dc] transition-colors font-medium underline underline-offset-2 decoration-slate-700 hover:decoration-[#0ed5dc]"
            >
              Acceso Clínico
            </Link>
          </div>
          <p>
            Desarrollado por{" "}
            <a
              href="https://github.com/GoTech-Studio/odontoclinic-app.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#0ed5dc] transition-colors font-medium underline underline-offset-2 decoration-slate-700 hover:decoration-[#0ed5dc]"
            >
              GoTech Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
