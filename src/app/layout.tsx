import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/multi-theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
 subsets: ["latin"],
 variable: "--font-inter",
 display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
 subsets: ["latin"],
 weight: ["400", "500", "600"],
 variable: "--font-ibm-plex-mono",
 display: "swap",
});

export const metadata: Metadata = {
 title: {
 default: "EducAItors",
 template: "%s | EducAItors",
 },
 description: "AI-powered educator dashboard for assignment evaluation, grading, and calibration.",
 metadataBase: new URL("https://educ-a-itors.vercel.app"),
 openGraph: {
 title: "EducAItors",
 description: "AI-powered educator dashboard for assignment evaluation, grading, and calibration.",
 url: "https://educ-a-itors.vercel.app",
 siteName: "EducAItors",
 locale: "en_US",
 type: "website",
 },
 twitter: {
 card: "summary_large_image",
 title: "EducAItors",
 description: "AI-powered educator dashboard for assignment evaluation, grading, and calibration.",
 },
 robots: {
 index: false,
 follow: false,
 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" suppressHydrationWarning>
 <body className={`${inter.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
 <ThemeProvider>
 <TooltipProvider>{children}</TooltipProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
