const plugin = require("tailwindcss/plugin");
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      letterSpacing: {
        display: "var(--tracking-display)",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("light", "html.light &");
    }),
  ],
};
