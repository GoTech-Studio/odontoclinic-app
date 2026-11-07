import React from "react";
import { PanelNavbar } from "@/components/panel/PanelNavbar";

export const metadata = {
  title: "Panel Clínico | OdontoClinic",
  description: "Gestión de agenda diaria, sala de espera y pacientes.",
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      <PanelNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
