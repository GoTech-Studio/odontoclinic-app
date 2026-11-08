import React from "react";
import { PanelNavbar } from "@/components/panel/PanelNavbar";
import { PanelThemeEffect } from "@/components/panel/PanelThemeEffect";

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
    <div className="panel-container min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      <PanelThemeEffect />
      <PanelNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-7 sm:pt-9 pb-8 sm:pb-12">
        {children}
      </main>
    </div>
  );
}
