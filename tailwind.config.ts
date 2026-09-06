import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cobalt: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          DEFAULT: "#1D4ED8", // Rich Cobalt Blue
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#0F172A",
        },
        // White & Light surfaces mapped to ensure comprehensive theme consistency
        forest: {
          900: "#FFFFFF", // Pure white main background
          800: "#FFFFFF", // White card surface
          700: "#F1F5F9", // Slate-100 hover / light surface
          600: "#E2E8F0", // Slate-200 border
        },
        gold: {
          DEFAULT: "#1D4ED8", // Cobalt Blue as primary brand accent
          light: "#2563EB",
          dark: "#1E40AF",
        },
        sage: {
          DEFAULT: "#059669", // Emerald for authorized, trust, and verified status
          light: "#10B981",
          dark: "#047857",
        },
        rust: {
          DEFAULT: "#E11D48", // Clean rose / alert
          light: "#F43F5E",
          dark: "#BE123C",
        },
        cream: {
          DEFAULT: "#0F172A", // Slate-900 primary high-contrast text
          dim: "#475569",    // Slate-600 secondary text
          subtle: "#94A3B8", // Slate-400 tertiary text
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        serif: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        "card-lg": "16px",
      },
      maxWidth: {
        phone: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
