import type { Metadata } from "next";
import { Jost, Poppins } from "next/font/google";
import { ProjectLocalProvider } from "@/components/ProjectLocalProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins-next",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost-next",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Relicario personalizado con foto — Relicario",
  description: "Relicario de acero inoxidable personalizado con tu foto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProjectLocalProvider>{children}</ProjectLocalProvider>
      </body>
    </html>
  );
}
