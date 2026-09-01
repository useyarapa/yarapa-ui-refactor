import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YARAPA",
  description: "YARAPA product app, built on the YARAPA UI foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas font-sans text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
