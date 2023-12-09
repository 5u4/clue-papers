"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    throw new Error(
      `Missing NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST`,
    );
  }

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "https://clue-papers.vercel.app/ingest",
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  });
}

export function PostHogPageview(): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <></>;
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
