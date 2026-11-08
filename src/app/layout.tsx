import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Platform",
  description: "Football news, live scores, and creator videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
