import type { Metadata } from "next";
import { Outfit, Figtree } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://baki.ai"),
  title: "baki — AI-Powered Support Agent",
  description:
    "Intelligent customer service solutions powered by natural language processing and automated support workflows.",
  icons: {
    icon: "/hero2.png",
    apple: "/hero2.png",
  },
  openGraph: {
    title: "baki — AI-Powered Support Agent",
    description:
      "Intelligent customer service solutions powered by natural language processing and automated support workflows.",
    url: "https://baki.ai",
    siteName: "baki",
    images: [
      {
        url: "/hero2.png",
        width: 640,
        height: 360,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "baki — AI-Powered Support Agent",
    description:
      "Intelligent customer service solutions powered by natural language processing and automated support workflows.",
    images: ["/hero2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${figtree.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
