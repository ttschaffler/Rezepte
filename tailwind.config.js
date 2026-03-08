/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8e7',
          100: '#fbefc0',
          200: '#f7dc80',
          300: '#f0c840',
          400: '#d4af37',
          500: '#b8941f',
          600: '#9a7a0f',
          700: '#7c6208',
          800: '#5e4a04',
          900: '#3d3002',
        },
        surface: {
          primary:   '#0f1419',
          secondary: '#1a1f28',
          card:      '#232934',
        },
        accent: {
          emerald: '#2dd4bf',
          ruby:    '#f87171',
        },
        border: {
          DEFAULT: '#334155',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
