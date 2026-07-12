import "../src/styles/global.css";
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "alexandria",
      values: [{ name: "alexandria", value: "#110b06" }],
    },
    layout: "fullscreen",
  },
};

export default preview;
