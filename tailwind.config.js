/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gym: {
          bg: '#0c1017',
          sidebar: '#0f1624',
          card: '#162032',
          'card-hover': '#1c2a42',
          border: '#22324b',
          'border-light': '#2d4160',
          active: '#00d284',
          'active-light': 'rgba(0, 210, 132, 0.12)',
          accent: '#0099ff',
          'accent-light': 'rgba(0, 153, 255, 0.12)',
          orange: '#ff6b35',
          'orange-light': 'rgba(255, 107, 53, 0.12)',
          purple: '#8b5cf6',
          'purple-light': 'rgba(139, 92, 246, 0.12)',
          text: '#f1f5f9',
          muted: '#8e9db5',
          heading: '#ffffff'
        }
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(0, 210, 132, 0.25)',
        'glow-blue': '0 0 15px rgba(0, 153, 255, 0.25)',
        'glow-orange': '0 0 15px rgba(255, 107, 53, 0.25)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
