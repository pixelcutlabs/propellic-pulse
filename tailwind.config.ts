import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#E21A6B",
          secondary: "#152534",
          accent: "#EB669C",
          bg: "#FFFFFF",
          text: "#152534",
          shadeDeep: "#482342",
          tintLight: "#F7BFD5",
          shadePunch: "#8F1F55",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Montserrat", "ui-sans-serif"],
        body: ["var(--font-body)", "Montserrat", "ui-sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        brand: "0 8px 24px rgba(21,37,52,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
