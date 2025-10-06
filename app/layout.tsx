import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisionCraft Studio",
  description: "Éditeur d'images IA — téléversez, décrivez, générez.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
