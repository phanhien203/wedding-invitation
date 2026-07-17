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
          50: "#EFF3E9",
          100: "#EAEEE7",
          300: "#BCC9B4",
          500: "#8AA17C",
          700: "#5E7351",
        },
        gold: "#C8A96A",
        // Màu chữ chính: xanh lá đậm (đồng bộ tông xanh của web).
        ink: "#2F3D26",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
        calligraphy: ["var(--font-calligraphy)", "cursive"],
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
        "leaf-fall": {
          from: { transform: "translate3d(0, -15vh, 0)" },
          to: { transform: "translate3d(0, 115vh, 0)" },
        },
        "leaf-sway": {
          from: { transform: "translateX(-16px) rotate(-25deg)" },
          to: { transform: "translateX(16px) rotate(35deg)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "bounce-slow": "bounceslow 2s ease-in-out infinite",
        "leaf-fall": "leaf-fall 10s linear infinite",
        "leaf-sway": "leaf-sway 3s ease-in-out infinite alternate",
        "spin-slow": "spin-slow 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
