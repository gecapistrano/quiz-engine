import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { BackgroundMusic } from "@/components/background-music";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Gem's 22nd Birthday Quiz | @gemcapistrano",
  description: "Gem's 22nd Birthday Quiz is over! You can still play for fun.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className={`${jakarta.className} min-h-full antialiased`}>
        <BackgroundMusic>{children}</BackgroundMusic>
      </body>
    </html>
  );
}
