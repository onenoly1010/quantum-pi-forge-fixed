/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#FF6200',
          600: '#ea580c',
        },
        quantum: {
          purple: '#7C3AED',
          blue: '#3B82F6',
          pink: '#EC4899',
        }
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      backgroundImage: {
        'quantum-gradient': 'linear-gradient(135deg, #FF6200 0%, #7C3AED 100%)',
        'pi-pattern': "url('/pi-pattern.svg')",
      },
      fontFamily: {
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace'],
      },
    },
  },
plugins: [
  // require('@tailwindcss/forms'),     // ← comment out
  // require('@tailwindcss/typography'), // ← comment out
],
}
