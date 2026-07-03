/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Editorial palette (imported from the Claude Design mockups). Warm cream
      // canvas, near-black "ink" text, and a single terracotta accent. Colours
      // carry the `<alpha-value>` placeholder so Tailwind's opacity modifiers
      // work (e.g. `text-ink/70`, `border-ink/12`) — the mockups lean heavily on
      // tinted ink for secondary text and hairline borders.
      colors: {
        cream: 'oklch(0.97 0.012 75 / <alpha-value>)',
        'cream-panel': 'oklch(0.94 0.015 75 / <alpha-value>)',
        'cream-code': 'oklch(0.955 0.01 75 / <alpha-value>)',
        ink: 'oklch(0.19 0.01 60 / <alpha-value>)',
        accent: 'oklch(0.48 0.12 40 / <alpha-value>)',
      },
      // Three families, loaded from Google Fonts in pages/_document.tsx:
      //   serif — Newsreader: headings, dataset titles, and editorial prose.
      //   sans  — Work Sans: labels, metadata, uppercase eyebrows, table cells.
      //   mono  — IBM Plex Mono: the SQL editor and query result cells.
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
