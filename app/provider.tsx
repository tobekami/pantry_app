// app/provider.tsx
"use client";

import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    // This connects MUI to the Next.js font loader
    fontFamily: 'var(--font-google-sans), "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 }, // Bold
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 }, // Semi-Bold
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 }, // Medium
    h6: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  palette: {
    primary: {
      main: '#6A9C78', // Sage Green
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F2F5F3', // Very light sage for backgrounds/cards
      contrastText: '#2D3436',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F9FAF9', // Slightly off-white for contrast
    },
    text: {
      primary: '#2D3436', // Soft Black
      secondary: '#636E72',
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '8px', boxShadow: 'none' },
        containedPrimary: { '&:hover': { backgroundColor: '#568061', boxShadow: 'none' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: 'none', border: '1px solid #E0E0E0' },
      },
    },
  },
});

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}