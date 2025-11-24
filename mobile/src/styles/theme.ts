/**
 * Design system theme for Smart Session Planner
 * Defines colors, typography, spacing, and other design tokens
 */

export const theme = {
  colors: {
    primary: {
      main: "#1E3A8A", // Dark blue from Figma
      light: "#3B82F6",
      dark: "#1E40AF",
    },
    secondary: {
      main: "#7C3AED", // Purple for Deep Work
      light: "#A78BFA",
      dark: "#6D28D9",
    },
    background: {
      main: "#F8FAFC",
      card: "#FFFFFF",
      section: "#E0F2FE", // Light blue for progress section
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
      light: "#94A3B8",
    },
    success: {
      main: "#10B981", // Green for completed sessions
      light: "#34D399",
    },
    session: {
      meditation: "#A7F3D0", // Light green
      meeting: "#E5E7EB", // Light gray
      deepWork: "#DDD6FE", // Light purple
      workout: "#A7F3D0", // Light green
      language: "#BFDBFE", // Light blue
    },
    border: "#E2E8F0",
    divider: "#F1F5F9",
  },
  typography: {
    fontFamily: {
      regular: "System",
      medium: "System",
      bold: "System",
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
    },
    fontWeight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },
  screenPadding: {
    horizontal: 20,
    top: 20,
    bottom: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;

export type Theme = typeof theme;

