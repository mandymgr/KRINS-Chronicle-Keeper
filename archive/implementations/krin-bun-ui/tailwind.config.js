/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/renderer/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ivory: "var(--ivory)",
        ink: "var(--ink)",
        stone: { 100:"var(--stone-100)", 200:"var(--stone-200)", 500:"var(--stone-500)" },
        accent: "var(--accent)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      borderRadius: { lg: "16px" },
    },
  },
  plugins: [],
};
