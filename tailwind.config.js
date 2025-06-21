/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Переопределяем ключ 'sans' или добавляем свой ключ.
        // Если хотите, чтобы встроенный класс font-sans указывал на Michroma:
        sans: ['Michroma', 'sans-serif'],
        // Если предпочитаете свой ключ, например:
        // custom: ['Michroma', 'sans-serif'],
      },
    },
  },
  plugins: [],
};