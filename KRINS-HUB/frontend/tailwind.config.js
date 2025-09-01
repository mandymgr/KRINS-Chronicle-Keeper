/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ivory: "var(--ivory)",
        ink: "var(--ink)",
        stone: { 
          100: "var(--stone-100)", 
          200: "var(--stone-200)", 
          500: "var(--stone-500)" 
        },
        accent: "var(--accent)",
        'accent-ink': "var(--accent-ink)",
        'ai-agent-active': "var(--ai-agent-active)",
        'ai-agent-inactive': "var(--ai-agent-inactive)",
        'ai-agent-processing': "var(--ai-agent-processing)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      borderRadius: { 
        lg: "16px" 
      },
    },
  },
  plugins: [],
};