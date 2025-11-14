/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Lora", "serif"],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "scrollbar-color": "rgb(156 163 175) rgb(243 244 246)",
        },
        ".scrollbar-thin-dark": {
          "scrollbar-width": "thin",
          "scrollbar-color": "rgb(107 114 128) rgb(229 231 235)",
        },
      });
    },
  ],
};
