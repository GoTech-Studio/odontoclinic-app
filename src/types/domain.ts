export type ImageSlotId =
  | "hero"
  | "doctor"
  | "clinic_1"
  | "clinic_2"
  | "clinic_3";

export interface ImageSlotMetadata {
  slot: ImageSlotId;
  section: string;
  src: string;
  defaultSrc: string;
  alt: string;
  label?: string;
  updatedAt?: string;
  storageProvider?: "default" | "local" | "cloudinary";
}

export type SiteImagesMap = Record<ImageSlotId, ImageSlotMetadata>;

export interface NavSectionItem {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
}

export type ServiceIconType =
  | "cleaning"
  | "orthodontics"
  | "whitening"
  | "smile_design"
  | "implants"
  | "general";

export interface ClinicServiceItem {
  id: string;
  title: string;
  icon: ServiceIconType;
  enabled: boolean;
}

export type AppointmentMode = "whatsapp" | "online_api";

export interface AppointmentPayload {
  name: string;
  phone: string;
  specialty: string;
  preferredTime: string;
  notes?: string;
  preferredDate?: string;
  honeypot?: string;
}

export interface AppointmentSubmissionResult {
  ok: boolean;
  mode: AppointmentMode;
  redirectUrl?: string;
  appointmentId?: string;
  error?: string;
}

export type AdminRole = "owner" | "doctor" | "staff";

export interface AdminPrincipal {
  authenticated: boolean;
  role: AdminRole;
  method: "api_key" | "session_cookie";
  subject: string;
}
