/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // UI Kit v2 Variant 12 — see BRANDBOOK.md
        forest: {
          50: '#F7F1ED',
          100: '#E3E9DF',
          200: '#C8D2C4',
          300: '#8FA894',
          400: '#5A7A5E',
          500: '#2F5233',
          600: '#244028',
          700: '#1B301F',
          800: '#122A4C',
          900: '#0C1C33',
        },
        sand: {
          50: '#F7F1ED',
          100: '#F4DADF',
          200: '#E3E9DF',
          300: '#C8D2C4',
        },
        snout: {
          navy: '#122A4C',
          forest: '#2F5233',
          rose: '#E8879A',
          ink: '#0C1C33',
          muted: '#5A6B7D',
          soft: '#8A9AAB',
          surface: '#F7F1ED',
          // legacy aliases
          lime: '#2F5233',
          teal: '#2F5233',
        },
        score: {
          poor: '#c45c3e',
          fair: '#c4922a',
          good: '#2F5233',
        },
      },
      fontFamily: {
        display: ['Fraunces_700Bold'],
        body: ['DMSans_400Regular'],
        'body-medium': ['DMSans_500Medium'],
        'body-bold': ['DMSans_700Bold'],
      },
    },
  },
  plugins: [],
};
