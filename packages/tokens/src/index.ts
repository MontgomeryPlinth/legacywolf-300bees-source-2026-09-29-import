export const colors = {
  obsidian: "#0A0A0A",
  graphite: "#161616",
  onyx: "#1F1F1F",
  guardianGreen: "#B5C42C",
  deepMoss: "#9AA826",
  ember: "#C43A2C",
  deepEmber: "#A4302C",
  white: "#FFFFFF",
  mist: "#B5B5B5",
  slate: "#7A7A7A",
  coal: "#2A2A2A",
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  24: 96,
} as const;

export const radii = { small: 8, input: 16, card: 20, pill: 999 } as const;

export const typography = {
  displayXL: {
    fontFamily: "Inter_900Black",
    fontSize: 64,
    lineHeight: 64,
    fontWeight: "900",
  },
  displayL: {
    fontFamily: "Inter_900Black",
    fontSize: 48,
    lineHeight: 52,
    fontWeight: "900",
  },
  displayM: {
    fontFamily: "Inter_900Black",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
  },
  heading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  bodySmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 0.96,
  },
  mono: {
    fontFamily: "monospace",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
} as const;

export const componentStateColors = {
  active: colors.guardianGreen,
  protected: colors.guardianGreen,
  progress: colors.guardianGreen,
  paused: colors.mist,
  trip: colors.mist,
  grace: colors.ember,
  alert: colors.ember,
  critical: colors.ember,
  disabled: colors.slate,
} as const;

export type ColorToken = keyof typeof colors;
