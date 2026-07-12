export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#faf8f1",
        ink: "#161616",
        line: "#d8d2c4",
        accent: "#2f6f73",
        cave: {
          amber: "#d4a052",
          brass: "#e8b86d",
          dim: "#8f806c",
          ink: "#17110d",
          stone: "#241b13",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Inter", '"Avenir Next"', '"Segoe UI"', '"Noto Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
