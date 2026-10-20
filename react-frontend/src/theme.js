//src/theme.js

import { createTheme } from "@mui/material/styles";

const FONT_FAMILY =
  '"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

const BORDER = "#E2E8F0";

const theme = createTheme({
  palette: {
    primary: { main: "#4F46E5", dark: "#4338CA", light: "#818CF8", contrastText: "#FFFFFF" },
    secondary: { main: "#7C3AED" },
    success: { main: "#059669" },
    warning: { main: "#D97706" },
    error: { main: "#E11D48" },
    background: { default: "#F6F7FB", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#64748B" },
    divider: BORDER,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: FONT_FAMILY,
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
    overline: { fontWeight: 700, letterSpacing: "0.12em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingLeft: 16, paddingRight: 16 },
        sizeLarge: { paddingTop: 11, paddingBottom: 11, fontSize: "1rem" },
        containedPrimary: {
          backgroundImage: "linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%)",
          boxShadow: "0 10px 24px -12px rgba(79, 70, 229, 0.8)",
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 18 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12, backgroundColor: "#FFFFFF" },
        notchedOutline: { borderColor: BORDER },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: 12,
          fontWeight: 700,
          color: "#64748B",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          backgroundColor: "#F8FAFC",
        },
        root: { borderColor: "#EEF2F7" },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 99, backgroundColor: "#EEF2FF" },
        bar: { borderRadius: 99 },
      },
    },
    MuiTooltip: { defaultProps: { arrow: true } },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 20 } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
  },
});

export default theme;
