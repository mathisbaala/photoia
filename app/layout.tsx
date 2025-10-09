import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const siteUrl = "https://photoia.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VisionCraft Studio",
    template: "%s | VisionCraft Studio",
  },
  description: "Éditeur d'images IA — téléversez, décrivez, générez.",
  keywords: [
    "photoia",
    "visioncraft",
    "next.js",
    "supabase",
    "replicate",
    "image editing",
    "ai"
  ],
  authors: [{ name: "Mathis Baala" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "VisionCraft Studio",
    description: "Éditeur d'images IA — téléversez, décrivez, générez.",
    siteName: "VisionCraft Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisionCraft Studio",
    description: "Éditeur d'images IA — téléversez, décrivez, générez.",
  }
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
