/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#006a46', // Stitch primary light
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          accent: '#54C28E', // Stitch primary dark
        },
        stitch: {
          // Light Mode Palette
          light: {
            bg: '#f6faff',
            surface: '#ffffff',
            card: '#ffffff',
            border: '#bec9c0',
            container: '#e6eff8',
            'container-low': '#ecf5fe',
            'container-high': '#e0e9f2',
            text: '#141d23',
            muted: '#3f4942',
            primary: '#006a46',
            'primary-container': '#23845d',
            'secondary-container': '#aaeecc',
            'on-secondary-container': '#2c6e53',
          },
          // Dark Mode Palette
          dark: {
            bg: '#0F1216',
            surface: '#14181D',
            card: '#1B2129',
            border: '#2A323D',
            container: '#222933',
            'container-low': '#181D24',
            'container-high': '#27303b',
            text: '#F1F5F9',
            muted: '#94A3B8',
            primary: '#54C28E',
            'primary-container': '#204634',
            'secondary-container': '#203a2e',
            'on-secondary-container': '#9ce3be',
          },
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
