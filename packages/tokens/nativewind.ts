import { colors, radii, spacing } from "./src";

export const nativeWindTheme = {
  colors,
  borderRadius: radii,
  spacing: Object.fromEntries(
    Object.entries(spacing).map(([key, value]) => [key, `${value}px`]),
  ),
};
