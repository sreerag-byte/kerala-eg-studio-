/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eg-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#1e3a8a',
        },
        'eg-slate': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        'drawing-bg': '#FAFAFA',
        'construction': '#888888',
        'visible-line': '#1a1a1a',
        'hidden-line': '#555555',
        'centre-line': '#2563eb',
        'dimension-line': '#374151',
        'projection-line': '#6b7280',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
        'drawing': ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
