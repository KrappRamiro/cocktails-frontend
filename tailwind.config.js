/** @type {import('tailwindcss').Config} */
const withAlpha = (cssVar) => `rgb(var(${cssVar}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brass: {
          400: withAlpha('--brass-400'),
          500: withAlpha('--brass-500'),
          600: withAlpha('--brass-600'),
        },
        burgundy: {
          700: withAlpha('--burgundy-700'),
          800: withAlpha('--burgundy-800'),
          900: withAlpha('--burgundy-900'),
        },
        ink: {
          600: withAlpha('--ink-600'),
          700: withAlpha('--ink-700'),
          800: withAlpha('--ink-800'),
          900: withAlpha('--ink-900'),
        },
        bone: {
          50: withAlpha('--bone-50'),
          100: withAlpha('--bone-100'),
          300: withAlpha('--bone-300'),
          500: withAlpha('--bone-500'),
        },
        base: withAlpha('--bg-base'),
        surface: withAlpha('--bg-surface'),
        elevated: withAlpha('--bg-elevated'),
        fg: withAlpha('--fg-primary'),
        muted: withAlpha('--fg-muted'),
        accent: withAlpha('--accent'),
        'accent-hover': withAlpha('--accent-hover'),
        danger: withAlpha('--danger'),
        'border-app': withAlpha('--border'),
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        deco: '0 0 0 1px rgb(var(--accent) / 0.25), 0 10px 30px rgb(0 0 0 / 0.45)',
        'deco-sm': '0 0 0 1px rgb(var(--accent) / 0.2), 0 2px 8px rgb(0 0 0 / 0.25)',
        'inner-rule': 'inset 0 -1px 0 rgb(var(--border) / 1)',
      },
      borderRadius: {
        deco: '2px 12px 2px 12px',
        'deco-lg': '4px 20px 4px 20px',
      },
      ringColor: {
        DEFAULT: withAlpha('--accent'),
      },
      letterSpacing: {
        deco: '0.14em',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
