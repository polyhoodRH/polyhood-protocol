import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WalletProvider } from "@/components/WalletProvider";
import { brand } from "@/config/brand";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-face",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0d14",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s — ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  // Favicon .webp wajib dideklarasikan manual: konvensi berkas Next hanya
  // mengenali ico/png/jpg/svg, jadi menaruh favicon.webp di app/ tidak cukup.
  icons: {
    icon: [{ url: "/favicon.webp", type: "image/webp" }],
    apple: [{ url: "/logo-square.webp" }],
  },
  openGraph: {
    type: "website",
    siteName: brand.name,
    url: brand.url,
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    images: [{ url: "/cover.webp", width: 1500, height: 500, alt: brand.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    images: ["/cover.webp"],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <WalletProvider>
          <Header />
          <main className="shell pt-4">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
