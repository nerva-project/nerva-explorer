import type { Metadata } from "next";
import { Rubik, JetBrains_Mono } from "next/font/google";
import "./globals.css";
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nerva Block Explorer - XNV",
  description:
    "Explore the Nerva (XNV) blockchain. Real-time blocks, transactions, network stats, mining difficulty, hashrate, and more.",
  keywords: [
    "Nerva",
    "XNV",
    "block explorer",
    "blockchain",
    "cryptocurrency",
    "privacy coin",
    "CPU mining",
  ],
  icons: {
    icon: "/explorer/favicon.ico",
    shortcut: "/explorer/favicon.ico",
  },
  openGraph: {
    title: "Nerva Block Explorer",
    description: "Real-time Nerva (XNV) blockchain explorer",
    siteName: "Nerva Explorer",
    type: "website",
  },
};

const themeScript = `
(function() {
  var s = localStorage.getItem('nerva-explorer-theme');
  var p = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = s === 'dark' || (s === null && p);
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${rubik.variable} ${jetbrains.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
