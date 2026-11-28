"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/planificacion", texto: "Planificación de procesos" },
  { href: "/", texto: "Reemplazo de páginas" },
];

export default function Navegacion() {
  const ruta = usePathname();

  return (
    <nav className="border-b border-gray-600">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className="mr-4 font-bold">Sistemas Operativos</span>
        {ENLACES.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className={
              "rounded-lg px-4 py-2 text-sm font-semibold transition " +
              (ruta === e.href
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700")
            }
          >
            {e.texto}
          </Link>
        ))}
      </div>
    </nav>
  );
}
