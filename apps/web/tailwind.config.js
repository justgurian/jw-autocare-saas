/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Retro palette — now reads from CSS custom properties
        retro: {
          cream: 'rgb(var(--color-retro-cream) / <alpha-value>)',
          red: 'rgb(var(--color-retro-red) / <alpha-value>)',
          teal: 'rgb(var(--color-retro-teal) / <alpha-value>)',
          mustard: 'rgb(var(--color-retro-mustard) / <alpha-value>)',
          navy: 'rgb(var(--color-retro-navy) / <alpha-value>)',
          mint: 'rgb(var(--color-retro-mint) / <alpha-value>)',
          pink: 'rgb(var(--color-retro-pink) / <alpha-value>)',
          orange: 'rgb(var(--color-retro-orange) / <alpha-value>)',
          brown: 'rgb(var(--color-retro-brown) / <alpha-value>)',
          chrome: 'rgb(var(--color-retro-chrome) / <alpha-value>)',
        },
        // Semantic surface colors
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-alt': 'rgb(var(--color-surface-alt) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        // Primary brand colors (full scale for gradients etc.)
        primary: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: 'rgb(var(--color-retro-red) / <alpha-value>)',
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
          500: 'rgb(var(--color-retro-teal) / <alpha-value>)',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
      },
      fontFamily: {
        display: ['"Oswald"', '"Franklin Gothic Medium"', 'sans-serif'],
        heading: ['"Oswald"', '"Franklin Gothic Medium"', 'sans-serif'],
        body: ['"Source Sans Pro"', '"Helvetica Neue"', 'sans-serif'],
      },
      boxShadow: {
        retro: 'var(--shadow-md)',
        'retro-sm': 'var(--shadow-sm)',
        'retro-lg': 'var(--shadow-lg)',
        card: 'var(--shadow-card)',
        neon: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor',
      },
      borderRadius: {
        retro: 'var(--radius-sm)',
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
        'swipe-right': 'swipe-right 0.4s ease-in forwards',
        'swipe-left': 'swipe-left 0.4s ease-in forwards',
        'swipe-up': 'swipe-up 0.4s ease-in forwards',
        'card-enter': 'card-enter 0.3s ease-out',
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
        'swipe-right': {
          '0%': { transform: 'translateX(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateX(150%) rotate(12deg)', opacity: '0' },
        },
        'swipe-left': {
          '0%': { transform: 'translateX(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateX(-150%) rotate(-12deg)', opacity: '0' },
        },
        'swipe-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-120%)', opacity: '0' },
        },
        'card-enter': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Mobile-first spacing
      spacing: {
        'safe': 'env(safe-area-inset-bottom, 0px)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'touch': '44px',
        'touch-lg': '48px',
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'btn': '44px',
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
    },
  },
  plugins: [],
};
