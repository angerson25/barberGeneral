import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#111827",
          accent: "#f59e0b",
        },
        // Paleta futurista (neón sobre fondo oscuro)
        ink: {
          900: "#05060a",
          800: "#0a0d16",
          700: "#0f1320",
          600: "#161b2c",
        },
        neon: {
          cyan: "#22d3ee",
          violet: "#a855f7",
          pink: "#ec4899",
          lime: "#a3e635",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.25), 0 0 30px -5px rgba(34,211,238,0.45)",
        "glow-violet":
          "0 0 0 1px rgba(168,85,247,0.25), 0 0 35px -5px rgba(168,85,247,0.5)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
