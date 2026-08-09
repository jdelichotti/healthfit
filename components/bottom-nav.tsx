"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/log", label: "Registrar" },
  { href: "/meals", label: "Comidas" },
  { href: "/weight", label: "Peso" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="sticky bottom-0 flex border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      {ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center py-2 text-xs ${
              active
                ? "font-medium text-black dark:text-white"
                : "text-zinc-500"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
