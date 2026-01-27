import { Provider } from "@/providers";
import "./global.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prehydrate.gruckion.com"),
  title: {
    default: "Prehydrate - Fix React Hydration Mismatches Instantly",
    template: "%s | Prehydrate",
  },
  description:
    "Show users real content before React hydrates. Eliminate hydration mismatches and loading flicker with one hook.",
  openGraph: {
    title: "Prehydrate - Fix React Hydration Mismatches Instantly",
    description:
      "Show users real content before React hydrates. Eliminate hydration mismatches and loading flicker with one hook.",
    url: "https://prehydrate.gruckion.com",
    siteName: "Prehydrate",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Prehydrate - Show users real content before React hydrates. Get Started Free.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prehydrate - Fix React Hydration Mismatches Instantly",
    description:
      "Show users real content before React hydrates. Eliminate hydration mismatches and loading flicker with one hook.",
    images: ["/og.png"],
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html className={inter.className} lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
