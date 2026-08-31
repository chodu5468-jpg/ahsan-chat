import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

const DEFAULT_BACKGROUND = { type: "default", value: "" };

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("ahsan_theme") || "light");
  const [background, setBackground] = useState(() => {
    const raw = localStorage.getItem("ahsan_bg");
    return raw ? JSON.parse(raw) : DEFAULT_BACKGROUND;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("ahsan_theme", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("ahsan_bg", JSON.stringify(background));
  }, [background]);

  const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider
      value={{ mode, setMode, toggleMode, background, setBackground, DEFAULT_BACKGROUND }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
