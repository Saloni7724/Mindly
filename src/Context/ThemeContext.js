import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("blue");

  // Load saved values
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedAccent = localStorage.getItem("accentColor");

    if (savedTheme) setTheme(savedTheme);
    if (savedAccent) setAccentColor(savedAccent);
  }, []);

  // Apply theme
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Apply accent globally
  useEffect(() => {
    const colorMap = {
      blue: "#3b82f6",
      purple: "#8b5cf6",
      green: "#22c55e",
      orange: "#f97316",
    };

    document.documentElement.style.setProperty(
      "--primary-color",
      colorMap[accentColor]
    );

    localStorage.setItem("accentColor", accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        accentColor,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
