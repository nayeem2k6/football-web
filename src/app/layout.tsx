import type { Metadata } from "next";
import { AccountProvider } from "@/components/auth/account-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
      <body className="min-h-screen bg-[#07110e] text-white antialiased">
        <AccountProvider>
          <SiteHeader />
          <a
            className="sr-only z-50 rounded-full bg-lime-300 px-4 py-2 font-semibold text-[#142012] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            href="#main-content"
          >
            Skip to content
          </a>
          <div
            className="mx-auto min-h-[calc(100vh-180px)] w-full max-w-7xl px-4 py-7 sm:px-8 sm:py-10"
            id="main-content"
          >
            {children}
          </div>
          <SiteFooter />
        </AccountProvider>
      </body>
    </html>
  );
}
