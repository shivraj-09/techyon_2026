"use client";

import React, { useRef } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { THEME_OPTIONS, type ThemePreference } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";

export interface ThemeSwitcherProps {
  variant?: "compact" | "menu";
  tone?: "default" | "on-navy";
  className?: string;
}

const OPTION_ICON: Record<ThemePreference, IconName> = {
  light: "sun",
  dark: "moon",
  system: "monitor",
};

export function ThemeSwitcher({
  variant = "compact",
  tone = "default",
  className = "",
}: ThemeSwitcherProps) {
  const { theme, mounted, setTheme } = useTheme();
  const groupRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % THEME_OPTIONS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = THEME_OPTIONS.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    const targetOption = THEME_OPTIONS[nextIndex];
    setTheme(targetOption.value);
    const buttons =
      groupRef.current?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[nextIndex]?.focus();
  }

  const groupClass = [
    "es-theme-switcher",
    variant === "menu" ? "is-menu" : "is-compact",
    tone === "on-navy" ? "is-on-navy" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label="Color theme"
      className={groupClass}
    >
      {THEME_OPTIONS.map((option, index) => {
        const isSelected = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${option.label} theme`}
            title={`${option.label} theme`}
            onClick={() => setTheme(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`es-theme-option ${isSelected ? "is-active" : ""}`.trim()}
          >
            <Icon name={OPTION_ICON[option.value]} size={variant === "menu" ? 13 : 14} />
            {variant === "menu" && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

