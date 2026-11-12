"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <div className="flex gap-1" role="group" aria-label="Tema">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Tema claro"
        onClick={() => setTheme("light")}
      >
        <Sun className="size-4" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Tema escuro"
        onClick={() => setTheme("dark")}
      >
        <Moon className="size-4" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Tema do sistema"
        onClick={() => setTheme("system")}
      >
        <Monitor className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
