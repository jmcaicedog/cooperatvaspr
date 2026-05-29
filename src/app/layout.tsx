import type { Metadata } from "next";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const noka = localFont({
  src: [
    {
      path: "../../public/fonts/noka-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/noka-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-noka",
  display: "swap",
});

const ligema = localFont({
  src: "../../public/fonts/ligema.woff2",
  variable: "--font-ligema",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "cooperativas.pr — Directorio de Cooperativas de Puerto Rico",
    template: "%s | cooperativas.pr",
  },
  description:
    "Descubre las cooperativas de Puerto Rico: directorio, mapa interactivo, servicios y contacto.",
  metadataBase: new URL("https://cooperativas.pr"),
  icons: {
    icon: [
      { url: "/icon.svg?v=20260529", type: "image/svg+xml" },
      { url: "/favicon.ico?v=20260529", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico?v=20260529",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${noka.variable} ${ligema.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
