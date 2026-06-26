import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiz Data Analytics — Avaliação de Maturidade Profissional",
  description: "Avalie sua maturidade como Analista ou Engenheiro de Dados com 35 questões técnicas, filtro de ferramentas e auto-avaliação de competências.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-xl">📊</span>
            <span className="font-bold text-gray-900">Quiz Data Analytics</span>
            <span className="text-xs text-gray-400 hidden sm:inline">Avaliação de Maturidade Profissional</span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
          Quiz Data Analytics — Avaliação baseada no PRD v6
        </footer>
      </body>
    </html>
  );
}
