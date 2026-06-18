import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SmoothScroll } from "@/components/smooth-scroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const SITE_NAME = "ResumeForge AI";
const SITE_DESCRIPTION =
  "Analyze, optimize and tailor your resume with AI. ATS scoring, job matching, cover letters, interview prep and more.";
const BASE_URL = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "ResumeForge AI \u2014 AI-Powered Resume Optimization",
    template: "%s | ResumeForge AI",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(BASE_URL),
  applicationName: SITE_NAME,
  keywords: [
    "resume",
    "AI resume",
    "ATS score",
    "resume optimization",
    "cover letter generator",
    "job matching",
    "interview prep",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "ResumeForge AI \u2014 AI-Powered Resume Optimization",
    description: SITE_DESCRIPTION,
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeForge AI \u2014 AI-Powered Resume Optimization",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <SmoothScroll>{children}</SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
