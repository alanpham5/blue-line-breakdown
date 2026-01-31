// tailwind.config.js
const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("light", "html.light &");
    }),
  ],
};
