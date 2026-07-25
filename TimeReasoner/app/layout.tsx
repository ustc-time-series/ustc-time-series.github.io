import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "timereasoner.local";
  const forwardedProtocol = headerList.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "TimeReasoner | Slow-Thinking Time Series Forecasting",
    description:
      "TimeReasoner studies whether slow-thinking LLMs can reason over temporal dynamics for accurate, training-free time series forecasting.",
    authors: [
      { name: "Mingyue Cheng" },
      { name: "Jiahao Wang" },
      { name: "Daoyu Wang" },
      { name: "Xiaoyu Tao" },
      { name: "Qi Liu" },
      { name: "Enhong Chen" },
    ],
    keywords: [
      "TimeReasoner",
      "time series forecasting",
      "slow-thinking LLMs",
      "inference-time reasoning",
      "WSDM 2026",
    ],
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "article",
      url: "/",
      title: "TimeReasoner",
      description:
        "Can slow-thinking LLMs reason over time? A training-free empirical study in time series forecasting.",
      siteName: "TimeReasoner",
      locale: "en_US",
      images: [
        {
          url: "/og.png",
          width: 1731,
          height: 909,
          alt: "TimeReasoner: observed time series flow through slow-thinking deliberation into a forecast",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "TimeReasoner",
      description:
        "Can slow-thinking LLMs reason over time? A WSDM 2026 empirical study.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
