"use client";

import React from "react";

export function FloatingWhatsApp() {
  const clinicPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "59178900000";

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Botón flotante limpio de WhatsApp */}
      <a
        href={`https://wa.me/${clinicPhone}?text=Hola%20Odontoclinic%20Camiri,%20quiero%20hacer%20una%20consulta%20con%20la%20Dra.%20Pamela%20Claros`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#009788] hover:bg-[#008375] text-white shadow-xl shadow-teal-700/25 hover:shadow-teal-700/40 hover:scale-105 active:scale-95 transition-all duration-300"
      >
        {/* Anillo de pulso exterior en hover */}
        <span className="absolute inset-0 rounded-full bg-[#009788] opacity-25 group-hover:animate-ping pointer-events-none" />
        
        {/* Ícono Oficial de WhatsApp */}
        <svg className="w-7 h-7 fill-white relative z-10" viewBox="0 0 24 24">
          <path d="M12.031 2C6.516 2 2.023 6.49 2.023 12.003c0 1.83.493 3.555 1.353 5.048L2 22l5.093-1.336a9.94 9.94 0 0 0 4.938 1.341c5.513 0 10.007-4.49 10.007-10.002C22.038 6.49 17.545 2 12.031 2zm0 18.258a8.21 8.21 0 0 1-4.186-1.144l-.3-.178-3.111.816.83-3.033-.195-.311a8.204 8.204 0 0 1-1.258-4.406c0-4.55 3.702-8.25 8.22-8.25 4.518 0 8.22 3.7 8.22 8.25 0 4.551-3.702 8.256-8.22 8.256zm4.507-6.177c-.247-.123-1.463-.722-1.69-.804-.227-.083-.393-.123-.559.123-.166.247-.64 0.804-.784.968-.144.164-.288.185-.535.062-.247-.123-1.042-.384-1.986-1.226-.734-.655-1.23-1.464-1.374-1.711-.144-.247-.015-.38.109-.502.111-.11.247-.288.371-.432.124-.144.165-.247.248-.411.082-.165.041-.309-.021-.432-.062-.124-.559-1.348-.766-1.848-.201-.486-.406-.42-.559-.428h-.476c-.165 0-.434.062-.661.309-.227.247-.868.849-.868 2.07 0 1.222.889 2.404 1.013 2.569.124.165 1.75 2.673 4.238 3.748.592.256 1.054.409 1.414.523.595.19 1.137.163 1.564.099.477-.071 1.463-.598 1.669-1.175.206-.577.206-1.072.145-1.175-.062-.103-.227-.165-.474-.288z" />
        </svg>
      </a>
    </div>
  );
}
