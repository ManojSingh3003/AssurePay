import type { Metadata } from "next";
import { Providers } from "./providers"; 
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "AssurePay",
  description: "The best secure payment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#f8fafc] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-300 transition-colors selection:bg-[#00B4D8]/30 selection:text-[#00B4D8]`}>
        <div className="grid-background pointer-events-none fixed inset-0 z-0"></div>
        <div className="relative z-10 h-full flex flex-col">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
