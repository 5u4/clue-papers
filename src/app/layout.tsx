import { Suspense } from "react";
import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { Footer } from "~/app/footer";
import { PHProvider, PostHogPageview } from "~/app/providers";
import { cn } from "~/utils/ui";

import "./globals.css";

export const metadata: Metadata = {
  title: "Clue Paper",
  description: "🔍 Online paper for the board game Clue / Cluedo",
  applicationName: "Clue Paper",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: [
    "clue",
    "cluedo",
    "online",
    "board game",
    "best board games",
    "clue solver",
    "clue paper online",
    "game",
    "clue with history",
  ],
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
        "min-h-screen h-full bg-background font-sans antialiased",
        `${GeistSans.variable} ${GeistMono.variable}`,
      )}
    >
      <Suspense>
        <PostHogPageview />
      </Suspense>

      <head />
      <PHProvider>
        <body className="h-full">
          <div className="h-full max-w-xl mx-auto py-4 px-2 sm:px-4 flex flex-col justify-between space-y-6">
            <div>{children}</div>
            <Footer />
          </div>
        </body>
      </PHProvider>
    </html>
  );
}
