import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { VialmarChat } from "@/components/ui/vialmar-chat";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vialmar — Cacao 100% Natural de Origen, Valle del Cauca, Colombia",
  description:
    "Más que cacao, una historia. Pastillas de cacao 100% natural, cultivo agroforestal artesanal desde nuestra finca en el Valle del Cauca.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-vialmar-cream text-vialmar-ink">
        {children}
        <VialmarChat />
      </body>
    </html>
  );
}
