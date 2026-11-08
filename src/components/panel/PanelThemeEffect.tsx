"use client";

import { useEffect } from "react";

export function PanelThemeEffect() {
  useEffect(() => {
    // Configurar overscroll dividido para el panel clínico:
    // Superior: azul marino (#0a1826) continuo con el navbar
    // Inferior: blanco / slate claro (#f8fafc) continuo con el fondo del panel
    const prevHtmlBackground = document.documentElement.style.background;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;

    document.documentElement.style.background =
      "linear-gradient(180deg, #0a1826 0%, #0a1826 50%, #f8fafc 50%, #f8fafc 100%) no-repeat";
    document.documentElement.style.backgroundColor = "#f8fafc";
    document.body.style.backgroundColor = "#f8fafc";

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
      document.documentElement.style.background = prevHtmlBackground;
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      if (createdMeta && meta) {
        meta.remove();
      } else if (meta && prevThemeColor) {
        meta.setAttribute("content", prevThemeColor);
      }
    };
  }, []);

  return null;
}
