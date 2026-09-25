/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color, #E07A5F)',
          hover: 'var(--primary-hover, #D0694E)',
          light: 'var(--primary-light, #FCEBE6)',
        },
        accent: {
          DEFAULT: 'var(--accent-color, #F59E0B)',
          hover: 'var(--accent-hover, #D97706)',
          light: 'var(--accent-light, #FEF3C7)',
        },
        fennec: {
          amber: '#E07A5F',
          orange: '#F59E0B',
          cream: '#FDF8F5',
          sand: '#F7EEEC',
          dark: '#1F1914',
          muted: '#8C7A6B',
        },
      },
      borderRadius: {
        lg: 'var(--radius, 0.75rem)',
        md: 'calc(var(--radius, 0.75rem) - 2px)',
        sm: 'calc(var(--radius, 0.75rem) - 4px)',
      },
    },
  },
  plugins: [],
};
