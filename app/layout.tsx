import type { Metadata } from "next";
import "./globals.css";
import "./eyegestures.css";

export const metadata: Metadata = {
  title: "Adaptive AAC - Intelligent Communication System",
  description: "An adaptive AAC system that learns from user interactions to provide personalized communication options",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
