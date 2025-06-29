import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
}

interface FloatingNavProps {
  className?: string;
  logo?: React.ReactNode;
  items?: NavItem[];
  cta?: React.ReactNode;
}

/**
 * A translucent, blurred navigation bar that gently floats over the content.
 * Based on the Aceternity UI FloatingNav example.
 */
export const FloatingNav: React.FC<FloatingNavProps> = ({
  className,
  logo = (
    <span className="font-serif text-lg font-semibold bg-gradient-to-r from-orange-300 to-rose-400 text-transparent bg-clip-text">
      Resume<span className="font-mono">AI</span>
    </span>
  ),
  items = [
    { href: "#", label: "Home" },
    { href: "#templates", label: "Templates" },
    { href: "#pricing", label: "Pricing" },
  ],
  cta = (
    <Button size="sm" className="h-8 px-4 text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
      Login
    </Button>
  ),
}) => {
  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-2 z-50 flex justify-center pointer-events-none",
        className
      )}
    >
      <div
        className="pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full bg-zinc-950/70 px-4 py-2 shadow-lg ring-1 ring-white/10 backdrop-blur-md"
      >
        {logo}
        <ul className="hidden md:flex gap-6 text-sm font-medium text-neutral-300">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="transition-colors duration-200 hover:text-white"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        {cta}
      </div>
    </nav>
  );
}; 