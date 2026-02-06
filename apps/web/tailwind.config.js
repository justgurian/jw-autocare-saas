/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Retro 1950s color palette
        retro: {
          cream: '#FDF6E3',
          red: '#C53030',
          teal: '#2C7A7B',
          mustard: '#D69E2E',
          navy: '#1A365D',
          mint: '#9AE6B4',
          pink: '#FED7E2',
          orange: '#DD6B20',
          brown: '#744210',
          chrome: '#A0AEC0',
        },
        // Primary brand colors (can be overridden per tenant)
        primary: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#C53030', // Retro red
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        secondary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#2C7A7B', // Retro teal
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
      },
      fontFamily: {
        // Retro typography
        display: ['"Bebas Neue"', '"Impact"', 'sans-serif'],
        heading: ['"Oswald"', '"Franklin Gothic Medium"', 'sans-serif'],
        body: ['"Source Sans Pro"', '"Helvetica Neue"', 'sans-serif'],
        script: ['"Pacifico"', 'cursive'],
      },
      boxShadow: {
        retro: '4px 4px 0px 0px rgba(0,0,0,0.9)',
        'retro-sm': '2px 2px 0px 0px rgba(0,0,0,0.9)',
        'retro-lg': '6px 6px 0px 0px rgba(0,0,0,0.9)',
        neon: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor',
      },
      borderRadius: {
        retro: '0px',
      },
      backgroundImage: {
        'checkerboard': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z' fill='%23000' fill-opacity='0.05'/%3E%3C/svg%3E\")",
        'diagonal-lines': "url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 0h1L0 5v1' fill='%23000' fill-opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'exhaust-rise': 'exhaust-rise 2s ease-out infinite',
        'tach-glow': 'tach-glow 1.5s ease-in-out infinite',
        'fade-crossfade': 'fade-crossfade 0.3s ease-out',
        'reveal-wipe': 'reveal-wipe 0.5s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'exhaust-rise': {
          '0%': { transform: 'translateY(0) scale(0.5)', opacity: '0.4' },
          '50%': { transform: 'translateY(-20px) scale(1)', opacity: '0.2' },
          '100%': { transform: 'translateY(-45px) scale(1.5)', opacity: '0' },
        },
        'tach-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px rgba(197, 48, 48, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 14px rgba(197, 48, 48, 0.7))' },
        },
        'fade-crossfade': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal-wipe': {
          '0%': { clipPath: 'inset(0 0 100% 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
      },
      // Mobile-first spacing
      spacing: {
        'safe': 'env(safe-area-inset-bottom, 0px)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'touch': '44px', // Minimum touch target
        'touch-lg': '48px', // Comfortable touch target
      },
      // Mobile-friendly minimum heights
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'btn': '44px',
      },
      // Mobile-friendly minimum widths
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
    },
  },
  plugins: [],
};
