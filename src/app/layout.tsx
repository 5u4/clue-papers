import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "~/utils/ui";

import "./globals.css";

export const metadata: Metadata = {
  title: "Clue Paper",
  description: "Clue Paper",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        `${GeistSans.variable} ${GeistMono.variable}`,
      )}
    >
      <head />
      <body>
        <div className="max-w-xl mx-auto py-4 px-1 md:px-2">{children}</div>
      </body>
    </html>
  );
}
