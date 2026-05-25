"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/cooperativa/perfil", label: "Perfil" },
  { href: "/cooperativa/servicios", label: "Servicios" },
  { href: "/cooperativa/contactos", label: "Contactos" },
  { href: "/cooperativa/galeria", label: "Galeria" },
];

export function CooperativeTabs() {
  const pathname = usePathname();

  return (
    <nav className="mt-3 flex flex-wrap gap-2 text-sm">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            className={`rounded-md border px-3 py-1.5 transition-colors ${
              isActive
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
            }`}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}