/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Brand renkleri için safelist
    {
      pattern: /^(bg|text|border|from|to|via|hover:bg|hover:text|hover:border|focus:border|focus:ring)-(brand|deep|accent)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    'bg-brand-50', 'bg-brand-100', 'bg-brand-200', 'bg-brand-300', 'bg-brand-400', 'bg-brand-500', 'bg-brand-600',
    'text-brand-50', 'text-brand-100', 'text-brand-200', 'text-brand-300', 'text-brand-400', 'text-brand-500', 'text-brand-600', 'text-brand-700',
    'border-brand-100', 'border-brand-200', 'border-brand-300', 'border-brand-400', 'border-brand-500',
    'hover:bg-brand-50', 'hover:bg-brand-100', 'hover:bg-brand-400', 'hover:bg-brand-500', 'hover:bg-brand-600',
    'hover:text-brand-500', 'hover:text-brand-600', 'hover:text-brand-700',
    'hover:border-brand-200', 'hover:border-brand-300', 'hover:border-brand-400',
    'from-brand-400', 'from-brand-500', 'to-brand-500', 'to-brand-600', 'via-brand-500',
    'from-deep-400', 'to-deep-400',
    'focus:border-brand-500', 'focus:ring-brand-200',
    'fill-brand-400',
  ],
  theme: {
    extend: {
      colors: {
        // Panel primary (mor)
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4b8fc',
          400: '#8093f9',
          500: '#636ef1',
          600: '#4f4ce6',
          700: '#423dcb',
          800: '#3734a4',
          900: '#323282',
        },
        // Petzzshop Kurumsal Renkler (MAKCOOP)
        brand: {
          50: '#FFF9F0',   // En açık turuncu tint
          100: '#FFF5EB',  // Açık turuncu tint
          200: '#FFE4CC',  // Hafif turuncu
          300: '#F9B87A',  // Orta turuncu
          400: '#EF7F1A',  // ANA TURUNCU (RGB: 239, 127, 26)
          500: '#D66A0F',  // Koyu turuncu
          600: '#B85A0D',  // Daha koyu
          700: '#8B4513',  // Kahverengimsi
          800: '#492D2B',  // KAHVERENGİ (RGB: 73, 45, 43)
          900: '#3D2422',  // En koyu
        },
        // Dip Sarısı
        yellow: {
          400: '#FECC00',  // DİP SARISI (RGB: 254, 204, 0)
          500: '#E5B800',
        },
        // Accent (soft pembe-kahve - petzzshop)
        accent: {
          light: '#f5e6e6',
          DEFAULT: '#d7a1a1',
          dark: '#c48888',
        },
        // Deep Orange (ikincil)
        deep: {
          50: '#fbe9e7',
          100: '#ffccbc',
          200: '#ffab91',
          300: '#ff8a65',
          400: '#ff7043',
          500: '#ff5722',
          600: '#f4511e',
        }
      }
    },
  },
  plugins: [],
}
