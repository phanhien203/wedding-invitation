import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F2",
        blush: {
          50: "#FDF4F2",
          100: "#FBE8E4",
          200: "#F5CFC7",
          300: "#EDB0A4",
          400: "#E08D7C",
          500: "#CF6B58",
        },
        sage: {
          100: "#EAEEE7",
          300: "#BCC9B4",
          500: "#8AA17C",
          700: "#5E7351",
        },
        gold: "#C8A96A",
        ink: "#3D3733",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceslow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "bounce-slow": "bounceslow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
