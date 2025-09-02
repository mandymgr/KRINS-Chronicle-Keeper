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
        paper: "var(--color-paper)",
        ivory: "var(--color-ivory)", 
        ink: "var(--color-ink)",
        stone: {
          100: "var(--stone-100)",
          200: "var(--stone-200)", 
          500: "var(--stone-500)"
        },
        accent: "var(--color-accent)",
        "accent-ink": "var(--accent-ink)",
        
        // AI Systems Colors
        "ai-active": "var(--ai-agent-active)",
        "ai-inactive": "var(--ai-agent-inactive)",
        "ai-processing": "var(--ai-agent-processing)",
        "ai-primary": "var(--ai-system-primary)",
        
        // Krin love colors
        "krin-love": "var(--krin-love)",
        "krin-love-light": "var(--krin-love-light)",
        "krin-love-dark": "var(--krin-love-dark)",
        
        // Legacy support
        background: "var(--color-ivory)",
        foreground: "var(--color-ink)",
      },
      textColor: {
        // Custom text colors
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        accent: "var(--color-accent)",
        stone: {
          500: "var(--stone-500)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        lg: "16px",
      },
    },
  },
  plugins: [],
};