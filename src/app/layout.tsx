import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const viewport: Viewport = {
  themeColor: "#009bb3",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://odontoclinic-camiri.vercel.app"),
  title: "OdontoClinic | Odontología Moderna en Camiri",
  description:
    "Atención odontológica cercana con una mirada moderna al cuidado de tu sonrisa en Camiri, Bolivia. Dra. Pamela Claros.",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "OdontoClinic | Odontología Moderna en Camiri",
    description:
      "Atención odontológica cercana con una mirada moderna al cuidado de tu sonrisa. Dra. Pamela Claros.",
    type: "website",
    locale: "es_BO",
    images: [
      {
        url: "/images/hero_doctor.jpg",
        width: 1200,
        height: 630,
        alt: "Dra. Pamela Claros en Odontoclinic Camiri",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} scroll-smooth antialiased`}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              ::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
              html, body {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
