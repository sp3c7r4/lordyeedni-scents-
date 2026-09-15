import type { Config } from 'tailwindcss';

/**
 * Design tokens for LORDYEEDNI SCENTS.
 * Black / white / one warm orange accent. Zero corner radius by default.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        paper: '#FFFFFF',
        accent: { DEFAULT: '#EE6C0E', dark: '#C2410C' },
        line: '#E8E4DF',
        rule: '#F0ECE7',
        mist: '#F6F4F1',
        stone: '#F4F1ED',
        muted: '#8A8580',
        quiet: '#A5A09B',
        copy: '#4A4643',
        danger: '#C2260F',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
        sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
      },
      spacing: { 13: '3.25rem' },
      letterSpacing: { label: '0.18em', wide: '0.14em' },
      borderRadius: { DEFAULT: '0px', none: '0px', pill: '999px' },
      keyframes: {
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-up': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'toast-in': { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { from: { backgroundPosition: '-400px 0' }, to: { backgroundPosition: '400px 0' } },
      },
      animation: {
        'slide-in': 'slide-in .32s cubic-bezier(.2,.8,.2,1) both',
        'fade-in': 'fade-in .25s ease both',
        'rise-up': 'rise-up .3s cubic-bezier(.2,.8,.2,1) both',
        'toast-in': 'toast-in .3s cubic-bezier(.2,.8,.2,1) both',
        shimmer: 'shimmer 1.2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
