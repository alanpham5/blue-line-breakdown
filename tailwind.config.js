module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("light", "@media (prefers-color-scheme: light)");
    },
  ],
};
