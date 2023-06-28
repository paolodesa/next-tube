import {
  createContext,
  useContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";

type Theme = "system" | "dark" | "light";

const DarkModeContext = createContext<{
  theme: Theme;
  setThemeHandler: (value: Theme) => void;
}>({
  theme: "system",
  setThemeHandler: (_value: Theme) => {
    return;
  },
});

export function useDarkModeContext() {
  return useContext(DarkModeContext);
}

export function DarkModeContextProvider(props: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const themeValue = stored ? (JSON.parse(stored) as Theme) : "system";
    setTheme(themeValue);
    !stored && localStorage.setItem("theme", JSON.stringify(themeValue));
    if (
      (themeValue === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      themeValue === "dark"
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const setThemeHandler = (newTheme: Theme) => {
    if (
      (newTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      newTheme === "dark"
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setTheme(newTheme);
    localStorage.setItem("theme", JSON.stringify(newTheme));
  };

  return (
    <DarkModeContext.Provider value={{ theme, setThemeHandler }}>
      {props.children}
    </DarkModeContext.Provider>
  );
}
