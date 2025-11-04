import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Responsive hover states - only apply on devices with hover capability
      screens: {
        'hover-device': { 'raw': '(hover: hover) and (pointer: fine)' },
      },
      colors: {
        background: "#0A0A0A",
        surface: "#121212",
        neutral: "#1E1E1E",
        primary: {
          DEFAULT: "#14F1C0",
          light: "#00D9F5",
          dark: "#00B894",
        },
        secondary: {
          DEFAULT: "#E14EFF",
          light: "#F78FF5",
          dark: "#C41EE8",
        },
        accent: {
          DEFAULT: "#FF005C",
          light: "#FF4081",
          dark: "#C40048",
        },
        positive: "#00FFA2",
        negative: "#FF426E",
        warning: "#FFC93C",
        muted: "#8C8C8C",
      },
      fontFamily: {
        heading: ["var(--font-urbanist)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 12px rgba(20, 241, 192, 0.5)",
        "glow-secondary": "0 0 12px rgba(225, 78, 255, 0.5)",
        "glow-accent": "0 0 12px rgba(255, 0, 92, 0.5)",
      },
      borderRadius: {
        lg: "1.5rem",
        md: "1rem",
        sm: "0.5rem",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-in",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(20, 241, 192, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(20, 241, 192, 0.8)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
