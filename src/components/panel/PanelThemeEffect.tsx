"use client";

import { useEffect } from "react";

export function PanelThemeEffect() {
  useEffect(() => {
    // Asegurar que el fondo del overscroll/canvas sea blanco exclusivamente en el panel clínico
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;

    document.documentElement.style.backgroundColor = "#ffffff";
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
