/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",

        primary: "oklch(var(--primary))",
        secondary: "oklch(var(--secondary))",
        destructive: "oklch(var(--destructive))",
        muted: "oklch(var(--muted))",
        accent: "oklch(var(--accent))",

        card: "oklch(var(--card))",
        popover: "oklch(var(--popover))",
      },
    },
  },
  plugins: [],
};