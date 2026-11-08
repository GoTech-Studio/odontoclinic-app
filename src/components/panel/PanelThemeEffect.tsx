"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PanelThemeEffect() {
  const pathname = usePathname();
  const isPanelRoute = pathname?.startsWith("/panel") ?? false;

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (!isPanelRoute) {
      html.classList.remove("panel-theme");
      body.classList.remove("panel-theme");
      html.style.removeProperty("background");
      html.style.removeProperty("background-color");
      body.style.removeProperty("background-color");
      return;
    }

    // Configurar overscroll dividido exclusivamente en rutas del panel clínico:
    // Superior: azul marino (#0a1826) continuo con el navbar
    // Inferior: blanco / slate claro (#f8fafc) continuo con el fondo del panel
    html.classList.add("panel-theme");
    body.classList.add("panel-theme");
    html.style.background =
      "linear-gradient(180deg, #0a1826 0%, #0a1826 50%, #f8fafc 50%, #f8fafc 100%) no-repeat";
    html.style.backgroundColor = "#f8fafc";
    body.style.backgroundColor = "#f8fafc";

    let meta = document.querySelector('meta[name="theme-color"]');
    let createdMeta = false;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
      createdMeta = true;
    }
    const prevThemeColor = meta.getAttribute("content");
    meta.setAttribute("content", "#0a1826");

    return () => {
      html.classList.remove("panel-theme");
      body.classList.remove("panel-theme");
      html.style.removeProperty("background");
      html.style.removeProperty("background-color");
      body.style.removeProperty("background-color");
      if (createdMeta && meta) {
        meta.remove();
      } else if (meta && prevThemeColor) {
        meta.setAttribute("content", prevThemeColor);
      }
    };
  }, [isPanelRoute]);

  return null;
}
