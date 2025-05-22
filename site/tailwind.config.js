const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // support wider width for large screens >1440px eg. in hero
      maxWidth: {
        "8xl": "88rem",
        "9xl": "1440px",
      },
      fontFamily: {
        sans: ['var(--font-roco)'],
        serif: ["ui-serif", ...defaultTheme.fontFamily.serif],
        mono: ["ui-monospace", ...defaultTheme.fontFamily.mono],
        headings: ["-apple-system", ...defaultTheme.fontFamily.sans],
        
      },
      colors: {
        background: {
          DEFAULT: colors.neutral[100],
          dark: colors.slate[950],
        },
        custom_blue: "#3c83f6",
        primary: {
          DEFAULT: colors.gray[800],
          dark: colors.gray[100],
        },
        secondary: {
          DEFAULT: colors.blue[400],
          dark: colors.blue[400],
        },
        "secondary-hover": {
          DEFAULT: colors.blue[300],
          dark: colors.blue[300],
        },
        keyframes: {
          float: {
            "0%, 100%": { transform: "translateY(-5%)" },
            "50%": { transform: "translateY(5%)" },
          },
        },
        animation: {
          float: "bounce-subtle 2s ease-in-out infinite",
        },
      },
      screens: {
        custom: "1350px",
        mini_sum: "420px",
      },
    },
  },
  /* eslint global-require: off */
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/typography"),
  ],
};
