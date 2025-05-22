import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import siteConfig from "../config/siteConfig";

export function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  /** Avoid Hydration Mismatch
   *  https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
   */
  if (!mounted) return null;

  if (!siteConfig.theme.default) return null;

  return (
    <button
      type="button"
      className={`
        min-w-fit pl-2 transition duration-500
        ${theme === "dark" ? "grayscale opacity-70" : ""}
      `}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <img
        src={siteConfig.theme.toggleIcon}
        alt="Toggle theme"
        title="Toggle theme"
        width={24}
        height={24}
        className="max-w-24 max-h-24"
      />
    </button>
  );
}
