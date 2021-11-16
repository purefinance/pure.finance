const plugin = require('tailwindcss/plugin')

// https://github.com/tailwindlabs/tailwindcss/discussions/1745#discussioncomment-145597
const capitalizeFirst = plugin(function ({ addUtilities }) {
  const newUtilities = {
    '.capitalize-first:first-letter': {
      textTransform: 'uppercase'
    }
  }
  addUtilities(newUtilities, ['responsive', 'hover'])
})

module.exports = {
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Inter']
    },
    extend: {
      fontSize: {
        '1.5xl': '1.375rem'
      },
      spacing: {
        5.5: '1.375rem',
        7.5: '1.875rem',
        15: '3.75rem',
        19: '4.75rem',
        54: '13.5rem',
        63: '15.75rem'
      },
      maxWidth: {
        customscreen: '1085px'
      },
      minHeight: {
        content: '700px'
      },
      colors: {
        vesper: '#4138AC'
      },
      gridTemplateColumns: {
        'approval-sm': 'minmax(0, 3.75rem) minmax(0, 1fr) max-content',
        approval:
          'minmax(0, 3.75rem) minmax(3.75rem, 1fr) minmax(0, 1fr) max-content'
      }
    }
  },
  variants: {},
  plugins: [capitalizeFirst]
}
