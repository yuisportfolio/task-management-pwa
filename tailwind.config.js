import daisyui from "daisyui"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    // 使いたいテーマを配列で入れる
    themes: ["light"]
    //["light", "cupcake", "retro", "nord"], 
  },
}