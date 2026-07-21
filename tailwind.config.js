/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Mapped to SnoutScore brand (lime → teal → ink). See BRANDBOOK.md
        forest: {
          50: '#f3fbf9',
          100: '#dff7f1',
          200: '#b7ebe0',
          300: '#7fd9c9',
          400: '#3fc4b0',
          500: '#00b39f',
          600: '#00a894',
          700: '#0a7a6e',
          800: '#16324a',
          900: '#111b2f',
        },
        sand: {
          50: '#f7faf9',
          100: '#eef5f3',
          200: '#d9e8e4',
          300: '#b8d4cd',
        },
        snout: {
          lime: '#72ED2F',
          teal: '#00E0C7',
          ink: '#111B2F',
        },
        score: {
          poor: '#c45c3e',
          fair: '#c4922a',
          good: '#0a9b7a',
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
