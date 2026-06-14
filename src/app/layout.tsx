import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resume to Portfolio AI — Turn Your Resume Into a Stunning Portfolio",
  description:
    "Upload your resume and instantly generate a personalized, recruiter-optimized portfolio website. AI-powered content enhancement with 3 professional design styles.",
  keywords: [
    "resume to portfolio",
    "AI portfolio generator",
    "personal website",
    "resume parser",
    "developer portfolio",
  ],
  openGraph: {
    title: "Resume to Portfolio AI",
    description: "Transform your resume into a professional portfolio in seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume to Portfolio AI",
    description: "Transform your resume into a professional portfolio in seconds.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
