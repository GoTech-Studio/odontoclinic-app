import { createBrowserClient } from "@supabase/ssr";

/**
 * Verifica si las variables de entorno de Supabase están configuradas en el entorno actual.
 * Importante: En Next.js client-side, solo las variables con prefijo NEXT_PUBLIC_ están disponibles en el navegador.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return Boolean(url && key && url.startsWith("http"));
}

/**
 * Cliente de Supabase para componentes del lado del cliente (Client Components)
 * Se ejecuta en el navegador y mantiene la sesión activa del usuario.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Variables de entorno no configuradas. Falta NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY en producción."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
