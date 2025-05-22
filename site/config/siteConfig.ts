import { defaultConfig } from "@portaljs/core";
import config from "../content/config";

export default {
  ...defaultConfig,
  ...config,
  // prevent theme object overrides for
  // values not provided in userConfig
  theme: {
    ...defaultConfig.theme,
    ...config?.theme,
  },
} as any;
