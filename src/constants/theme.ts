export const lightColors = {
  background: "#F4F5F7",
  card: "#FFFFFF",
  text: "#14161A",
  textMuted: "#6B7280",
  border: "#E2E4E9",
  primary: "#2563EB",
  danger: "#DC2626",
  success: "#16A34A",
  warning: "#B45309",
};

export const darkColors: typeof lightColors = {
  background: "#0F1115",
  card: "#181B21",
  text: "#F2F4F7",
  textMuted: "#9BA2AD",
  border: "#2A2E36",
  primary: "#4F8BF0",
  danger: "#F05252",
  success: "#35C06A",
  warning: "#E0A32E",
};

export type Colors = typeof lightColors;
