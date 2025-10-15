const plugin = require('tailwindcss/plugin')

// https://github.com/tailwindlabs/tailwindcss/discussions/1745#discussioncomment-145597
const capitalizeFirst = plugin(function ({ addUtilities }) {
  const newUtilities = {
    '.capitalize-first:first-letter': {
      textTransform: 'uppercase'
    }
  }
  addUtilities(newUtilities)
})

module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}'
  ],
  plugins: [capitalizeFirst],
  theme: {
    extend: {
      colors: {
        grayscale: {
          50: '#FAFAFA',
          100: '#E5E6E6',
          200: '#CCCCCC',
          300: '#D4D4D8',
          400: '#A3A3A3',
          500: '#737373',
          600: '#666767',
          700: '#4D4E4E',
          800: '#333535',
          900: '#1A1B1B',
          950: '#0A0A0A'
        },
        hemi: '#FF5F00',
        slate: {
          50: '#F7F7F7',
          100: '#E5E6E6',
          200: '#CCCCCC',
          300: '#B2B3B3',
          400: '#999A9A',
          500: '#808080',
          600: '#666767',
          700: '#4D4E4E',
          800: '#333535',
          900: '#1A1B1B',
          950: '#000202'
        },
        vesper: '#4138AC'
      },
      container: {
        center: true,
        padding: '2rem'
      },
      fontFamily: {
        inter: '--font-inter'
      },
      gridTemplateColumns: {
        'approval':
          'minmax(0, 3.75rem) minmax(3.75rem, 1fr) minmax(0, 1fr) max-content',
        'approval-sm': 'minmax(0, 3.75rem) minmax(0, 1fr) max-content'
      },
      spacing: {
        5.5: '1.375rem',
        7.5: '1.875rem',
        15: '3.75rem',
        19: '4.75rem',
        54: '13.5rem',
        63: '15.75rem',
        100: '25rem',
        128: '30rem',
        150: '40rem',
        200: '50rem'
      }
    }
  }
}
