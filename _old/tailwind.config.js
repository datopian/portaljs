const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  // purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  content: [
    "./pages/**/*.js",
    "./pages/**/*.ts",
    "./pages/**/*.jsx",
    "./pages/**/*.tsx",
    "./components/**/*.js",
    "./components/**/*.ts",
    "./components/**/*.jsx",
    "./components/**/*.tsx",
    "./lib/markdown.mjs",
    "./node_modules/@portaljs/core/dist/*.js",
    "./node_modules/@portaljs/core/*.js",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        mono: ["Inconsolata", ...defaultTheme.fontFamily.mono]
      },
      maxWidth: {
        "8xl": "88rem",
      },
      colors: {
        background: {
          DEFAULT: colors.neutral[100],
          dark: colors.slate[950],
        },
        primary: {
          DEFAULT: colors.gray[800],
          dark: colors.gray[100],
        },
        secondary: {
          DEFAULT: "#60a5fa",
          dark: "#60a5fa",
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
