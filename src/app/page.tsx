"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/ServicesSection";
import { DoctorProfile } from "@/components/DoctorProfile";
import { ClinicSection } from "@/components/ClinicSection";
import { LocationAndContact } from "@/components/LocationAndContact";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { AppointmentModal } from "@/components/AppointmentModal";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const handleOpenBooking = (service?: unknown) => {
    if (typeof service === "string") {
      setSelectedService(service);
    } else {
      setSelectedService(undefined);
    }
    setIsBookingOpen(true);
  };
  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedService(undefined);
  };

  return (
    <main className="relative min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      {/* 1. Header / Navbar con botón oscuro "Agendar una cita" */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* 2. Hero: "Tu sonrisa, en manos expertas" + 4 Badges */}
      <Hero onOpenBooking={handleOpenBooking} />

      {/* 3. Servicios: "Cuidamos cada detalle de tu sonrisa" (Layout dividido con 6 tarjetas 3x2) */}
      <ServicesSection onOpenBooking={handleOpenBooking} />

      {/* 4. Conoce a la doctora: Dra. Pamela Claros (3 columnas) */}
      <DoctorProfile onOpenBooking={handleOpenBooking} />

      {/* 5. La Clínica: "Un espacio pensado para tu comodidad" + 3 fotos en fila */}
      <ClinicSection />

      {/* 6. Ubicación & Contacto: Mapa con pin "Camiri, Bolivia" + Datos + Contacto */}
      <LocationAndContact onOpenBooking={handleOpenBooking} />

      {/* 7. Preguntas Frecuentes: "¿Tienes dudas?" + Acordeón 3 preguntas */}
      <FaqSection />

      {/* 8. Footer: Barra inferior azul marino oscuro con lema y botón de cita */}
      <Footer onOpenBooking={handleOpenBooking} />

      {/* Modal de Agendamiento Directo a WhatsApp */}
      <AppointmentModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        initialService={selectedService}
      />

      {/* Botón Flotante para Volver Arriba */}
      <ScrollToTop />
    </main>
  );
}
