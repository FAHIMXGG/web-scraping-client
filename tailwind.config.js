import keepPreset from "keep-react/src/keep-preset.js";
export default {
  content: ["node_modules/keep-react/**/*.{js,jsx,ts,tsx}", "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  presets: [keepPreset],
};

