/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Krin Editorial Design System
        paper: "var(--paper)",
        ivory: "var(--ivory)", 
        ink: "var(--ink)",
        stone: {
          100: "var(--stone-100)",
          200: "var(--stone-200)", 
          500: "var(--stone-500)"
        },
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        
        // AI Systems Colors
        "ai-active": "var(--ai-agent-active)",
        "ai-inactive": "var(--ai-agent-inactive)",
        "ai-processing": "var(--ai-agent-processing)",
        "ai-primary": "var(--ai-system-primary)",
        
        // Legacy support
        background: "var(--ivory)",
        foreground: "var(--ink)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      borderRadius: {
        lg: "16px",
      },
    },
  },
  plugins: [],
};