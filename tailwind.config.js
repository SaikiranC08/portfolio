/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        notion: {
          bg: "#ffffff",
          sidebar: "#f7f7f5",
          hover: "rgba(55, 53, 47, 0.08)",
          active: "rgba(55, 53, 47, 0.05)",
          border: "#e9e9e7",
          subtle: "rgba(55, 53, 47, 0.65)",
          muted: "rgba(55, 53, 47, 0.45)",
          text: "#37352f",
          yellowCallout: "#fbf3db",
          yellowBorder: "#f1e5bc",
          blueCallout: "#edf3f8",
          blueBorder: "#dbe8f2",
          grayCallout: "#f1f1ef",
          tagPink: "#fbe4e4",
          tagPinkText: "#c4554d",
          tagGreen: "#dbeddb",
          tagGreenText: "#286644",
          tagBlue: "#d3e5ef",
          tagBlueText: "#205d86",
          tagYellow: "#fdecc8",
          tagYellowText: "#8f632d",
          tagOrange: "#fadec9",
          tagOrangeText: "#854c1d",
          tagPurple: "#e8deee",
          tagPurpleText: "#5c3882",
          tagGray: "#e3e2e0",
          tagGrayText: "#32302c"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
};
