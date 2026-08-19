"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: {
      main: '#0a66c2', // Primary Blue
      light: '#e8f3ff', // Intermediate Light Blue
      dark: '#004182',
    },
    background: {
      default: '#ffffff', // White background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'inherit', // To use the Next.js Geist font
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
