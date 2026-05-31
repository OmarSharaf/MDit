import { useEffect } from "react";
import { useStore } from "../store/useStore";

export function useTheme() {
  const theme = useStore((s) => s.settings.theme);
  const highContrast = useStore((s) => s.settings.highContrast);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-reduced-motion", reducedMotion);
  }, [reducedMotion]);
}
