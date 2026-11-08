import {
  ClinicServiceItem,
  ImageSlotId,
  ImageSlotMetadata,
  NavSectionItem,
  SiteImagesMap,
} from "@/types/domain";

export const WHATSAPP_CLINIC_NUMBER = "59174649956";

/**
 * Navegación centralizada: agregar o desactivar una sección aquí
 * actualiza automáticamente tanto el menú de escritorio como el menú móvil.
 */
export const NAV_SECTIONS: NavSectionItem[] = [
  { id: "inicio", label: "Inicio", href: "#inicio", enabled: true },
  { id: "servicios", label: "Servicios", href: "#servicios", enabled: true },
  { id: "doctora", label: "La doctora", href: "#doctora", enabled: true },
  { id: "clinica", label: "La clínica", href: "#clinica", enabled: true },
  { id: "ubicacion", label: "Ubicación", href: "#ubicacion", enabled: true },
  { id: "faq", label: "Preguntas", href: "#faq", enabled: true },
];

/**
 * Catálogo único de servicios odontológicos:
 * Consumido por ServicesSection.tsx y por el validador/selector de AppointmentModal.tsx.
 */
export const CLINIC_SERVICES: ClinicServiceItem[] = [
  {
    id: "limpieza-profunda",
    title: "Limpieza profunda",
    icon: "cleaning",
    enabled: true,
  },
  {
    id: "restauraciones-esteticas",
    title: "Restauraciones estéticas",
    icon: "whitening",
    enabled: true,
  },
  {
    id: "tratamiento-de-conducto",
    title: "Tratamiento de conducto",
    icon: "root_canal",
    enabled: true,
  },
  {
    id: "protesis-fija-y-removible",
    title: "Prótesis fija y removible",
    icon: "orthodontics",
    enabled: true,
  },
  {
    id: "implantes-dentales",
    title: "Implantes dentales",
    icon: "implants",
    enabled: true,
  },
  {
    id: "cirugias-alta-complejidad",
    title: "Cirugías de alta complejidad",
    icon: "surgery",
    enabled: true,
  },
];

export const EXTRA_BOOKING_OPTIONS: string[] = ["Valoración general / Otro"];

export function getAllowedServiceNames(): string[] {
  return [
    ...CLINIC_SERVICES.filter((s) => s.enabled).map((s) => s.title),
    ...EXTRA_BOOKING_OPTIONS,
  ];
}

export const SCHEDULE_PREFERENCES: string[] = [
  "Mañana (9:00 - 13:00)",
  "Tarde (13:00 - 17:00)",
  "Sábado (9:00 - 12:00)",
];

/**
 * Registro centralizado de slots de imágenes administrables vía API (/api/admin/images).
 * Para agregar nuevas imágenes administrables en el futuro, basta con añadir el slot aquí.
 */
export const IMAGE_SLOTS_REGISTRY: SiteImagesMap = {
  hero: {
    slot: "hero",
    section: "Hero Principal",
    src: "/images/hero_dentist_v2.webp",
    defaultSrc: "/images/hero_dentist_v2.webp",
    alt: "Profesional de odontología con mascarilla en Odontoclinic",
    label: "Hero profesional de odontología",
    storageProvider: "default",
  },
  doctor: {
    slot: "doctor",
    section: "Conoce a la Doctora",
    src: "/images/doctor_profile_v2.webp",
    defaultSrc: "/images/doctor_profile_v2.webp",
    alt: "Dra. Pamela Claros en Odontoclinic",
    label: "Dra. Pamela Claros",
    storageProvider: "default",
  },
  clinic_1: {
    slot: "clinic_1",
    section: "La Clínica (Foto 1)",
    src: "/images/clinic_real_1.webp",
    defaultSrc: "/images/clinic_real_1.webp",
    alt: "Sillón odontológico ergonómico con pantalla intraoral",
    label: "Sillón ergonómico con monitor",
    storageProvider: "default",
  },
  clinic_2: {
    slot: "clinic_2",
    section: "La Clínica (Foto 2)",
    src: "/images/clinic_real_2.webp",
    defaultSrc: "/images/clinic_real_2.webp",
    alt: "Unidad odontológica clínica y lámpara quirúrgica",
    label: "Equipamiento de diagnóstico",
    storageProvider: "default",
  },
  clinic_3: {
    slot: "clinic_3",
    section: "La Clínica (Foto 3)",
    src: "/images/clinic_real_3.webp",
    defaultSrc: "/images/clinic_real_3.webp",
    alt: "Consultorio odontológico Odontoclinic en Camiri",
    label: "Consultorio y atención",
    storageProvider: "default",
  },
};

export const VALID_IMAGE_SLOTS = Object.keys(
  IMAGE_SLOTS_REGISTRY
) as ImageSlotId[];

export function isValidImageSlot(slot: unknown): slot is ImageSlotId {
  return (
    typeof slot === "string" &&
    Object.prototype.hasOwnProperty.call(IMAGE_SLOTS_REGISTRY, slot)
  );
}

export function cloneDefaultSiteImages(): SiteImagesMap {
  const result = {} as SiteImagesMap;
  for (const key of VALID_IMAGE_SLOTS) {
    result[key] = { ...IMAGE_SLOTS_REGISTRY[key] } as ImageSlotMetadata;
  }
  return result;
}
