import type { Config } from "tailwindcss";

import baseConfig from "@kdx/tailwind-config";
import { uiConfig }from "@kdx/ui";

export default {
  presets: [baseConfig, uiConfig],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/components/**/*.{ts,tsx}",
  ],
} satisfies Config;
