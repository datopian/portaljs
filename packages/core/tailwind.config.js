const { join } = require('path');
// const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    join(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
  ],
  darkMode: "class",
  theme: {
    extend: {
      // support wider width for large screens >1440px eg. in hero
      maxWidth: {
        "8xl": "88rem",
      },
      // fontFamily: {
      //   sans: ["ui-sans-serif", ...defaultTheme.fontFamily.sans],
      //   serif: ["ui-serif", ...defaultTheme.fontFamily.serif],
      //   mono: ["ui-monospace", ...defaultTheme.fontFamily.mono],
      //   headings: ["-apple-system", ...defaultTheme.fontFamily.sans],
      // },
      colors: {
        background: {
          DEFAULT: colors.white,
          dark: colors.slate[900],
        },
        primary: {
          DEFAULT: colors.gray[700],
          dark: colors.gray[300],
        },
        secondary: {
          DEFAULT: colors.sky[400],
          dark: colors.sky[400],
        },
      },
    },
  },
  /* eslint global-require: off */
  // plugins: [
  //   require("@tailwindcss/typography")
  // ],
};
