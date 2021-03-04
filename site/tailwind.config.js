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
      }
    }
  },
  variants: {},
  plugins: []
}
