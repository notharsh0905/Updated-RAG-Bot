/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        csjmu: {
          navy: "#002B49",
          crimson: "#A51C30",
          darkCrimson: "#8B0000",
          redAccent: "#C0392B",
          gold: "#D4AF37",
          lightBlue: "#E2E8F0",
          cardDark: "#1E293B",
          borderDark: "#334155",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
}
