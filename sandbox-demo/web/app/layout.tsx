import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pipeline AI Builder",
  description: "Efficient and powerful no-code AI pipeline builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex max-h-screen max-w-screen flex-col items-center justify-between">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
