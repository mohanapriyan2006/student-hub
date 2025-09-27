/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'academic-blue': '#2E5C9A',
        'growth-green': '#4CAF50',
        'accent-yellow': '#FFB400',
        'soft-red': '#E63946',
        'success-teal': '#2DCE89',
        'light-bg': '#F9FAFB'
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-academic': 'linear-gradient(135deg, #2E5C9A 0%, #4CAF50 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      },
      boxShadow: {
        'academic': '0 4px 6px -1px rgba(46, 92, 154, 0.1), 0 2px 4px -1px rgba(46, 92, 154, 0.06)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}