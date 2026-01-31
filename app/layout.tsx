import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Light Control",
  description: "Control your light on/off",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
