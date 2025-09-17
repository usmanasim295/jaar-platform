import { type Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontSize: {
        heading1: ["2rem", { lineHeight: "2.5rem" }], // 32px / 40px
        heading2: ["1.5rem", { lineHeight: "100%" }], // 24px / 100%
        body: ["0.875rem", { lineHeight: "1.375rem" }], // 14px / 22px
        label: ["1rem", { lineHeight: "100%" }], // 16px / 100%
      },

      fontFamily: {
        urbanist: ["Urbanist", "sans-serif"],
        jakarta: ['"Plus Jakarta Sans"', "sans-serif"],
        avenir: ['"Avenir Next"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
