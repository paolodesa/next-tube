import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "text-secondary": "#606060",
        "text-secondary-dark": "#aaa",
        "yt-blue": "#065fd4",
        "yt-blue-dark": "#3ea6ff",
      },
    },
  },
  darkMode: 'class',
  plugins: [require("vidstack/tailwind.cjs")],
} satisfies Config;
