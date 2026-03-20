import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

useEffect(() => {
  const applyTheme = () => {
    let appliedTheme = theme;

    if (theme === "auto") {
      const currentHour = new Date().getHours();

      if (currentHour >= 19 || currentHour < 7) {
        appliedTheme = "dark";
      } else {
        appliedTheme = "light";
      }
    }

    document.body.setAttribute("data-theme", appliedTheme);
  };

  applyTheme(); // run immediately

  const interval = setInterval(applyTheme, 60000); // check every 1 min

  localStorage.setItem("theme", theme);

  return () => clearInterval(interval);
}, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}