import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import ThemeProviderWrapper from "./provider";

// Load Google Sans locally
// Load the variable font
const googleSans = localFont({
  src: "./fonts/GoogleSans-Variable.ttf", // Path to your file
  variable: "--font-google-sans",       // This is the CSS variable name
  display: "swap",                      // Ensures text shows up immediately
});

export const metadata: Metadata = {
  title: "Smart Pantry Tracker",
  description: "AI-powered inventory and recipe management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={googleSans.variable} style={{ margin: 0, padding: 0 }}>
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
