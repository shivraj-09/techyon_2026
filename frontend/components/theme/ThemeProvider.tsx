"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyThemeToDocument,
  persistTheme,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

export interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  mounted: boolean;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  mounted: false,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    const resolved = applyThemeToDocument(stored);
    setThemeState(stored);
    setResolvedTheme(resolved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    function handleSystemChange() {
      if (readStoredTheme() === "system") {
        setResolvedTheme(applyThemeToDocument("system"));
      }
    }

    function handleStorageChange(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = readStoredTheme();
      setThemeState(next);
      setResolvedTheme(applyThemeToDocument(next));
    }

    mediaQuery?.addEventListener("change", handleSystemChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      mediaQuery?.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [mounted]);

  const setTheme = useCallback((next: ThemePreference) => {
    persistTheme(next);
    setThemeState(next);
    setResolvedTheme(applyThemeToDocument(next));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: mounted ? resolvedTheme : resolveTheme(theme),
      mounted,
      setTheme,
    }),
    [theme, resolvedTheme, mounted, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

