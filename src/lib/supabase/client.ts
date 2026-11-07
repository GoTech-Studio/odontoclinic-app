import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para componentes del lado del cliente (Client Components)
 * Se ejecuta en el navegador y mantiene la sesión activa del usuario.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createBrowserClient(supabaseUrl, supabaseKey);
}
