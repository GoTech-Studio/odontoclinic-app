import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  textClassName?: string;
  variant?: "teal" | "white";
  lightMode?: boolean;
}

export function Logo({
  className = "",
  showText = true,
  size = "md",
  textClassName = "",
  variant,
  lightMode = false,
}: LogoProps) {
  const isWhite = variant === "white" || lightMode;

  const iconPixelSizes = {
    sm: 26,
    md: 32,
    lg: 40,
  };

  const textSizes = {
    sm: "text-lg font-bold",
    md: "text-xl font-bold",
    lg: "text-2xl font-bold",
  };

  const logoSrc = isWhite ? "/images/logo-footer.png" : "/images/logo-navbar.png";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Ícono Oficial Odontoclinic */}
      <div className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
        <Image
          src={logoSrc}
          alt="Odontoclinic"
          width={iconPixelSizes[size]}
          height={iconPixelSizes[size]}
          className="object-contain w-auto h-7 sm:h-8"
          priority
          unoptimized
        />
      </div>

      {/* Tipografía Oficial Odontoclinic */}
      {showText && (
        <span
          className={`tracking-tight transition-colors ${textSizes[size]} ${
            isWhite ? "text-white" : "text-slate-900"
          } ${textClassName}`}
        >
          Odontoclinic
        </span>
      )}
    </div>
  );
}

