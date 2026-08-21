/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brandbook option 1 — phone HTML + Брендбук (see src/theme/brand.ts)
        forest: {
          50: '#EAF7F3',
          100: '#CBEBE1',
          200: '#9FD8CB',
          300: '#5BB8A4',
          400: '#2A8F7A',
          500: '#0E6E5D',
          600: '#0A5346',
          700: '#083F35',
          800: '#152233',
          900: '#0C1620',
        },
        sand: {
          50: '#F4F3F1',
          100: '#EAE7E2',
          200: '#D8D5D0',
          300: '#C4C0B8',
        },
        snout: {
          navy: '#0E6E5D',
          forest: '#1EAE5C',
          rose: '#D9534F',
          ink: '#152233',
          muted: '#5B6B75',
          soft: '#8b96a0',
          surface: '#F4F3F1',
          lime: '#1EAE5C',
          teal: '#0E6E5D',
        },
        score: {
          poor: '#D9534F',
          fair: '#F0A93A',
          good: '#1EAE5C',
        },
      },
      fontFamily: {
        display: ['Manrope_700Bold'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
