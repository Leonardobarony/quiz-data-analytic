import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dataside · Quiz Data Analytics — Avaliação de Maturidade Profissional",
  description: "Avalie sua maturidade como Analista ou Engenheiro de Dados com questões técnicas e auto-avaliação de competências. Desenvolvido pela Dataside.",
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
          <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-dataside.png" alt="Dataside" className="h-20 w-auto" />
              <div className="hidden sm:block h-5 w-px bg-gray-200" />
              <span className="hidden sm:block text-xs text-gray-500">Quiz Data Analytics</span>
            </div>
            <span className="text-xs text-gray-400 hidden md:inline">Avaliação de Maturidade Profissional</span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
          Desenvolvido pela{' '}
          <span className="font-medium text-blue-500">Dataside</span>
          {' '}· Avaliação de Maturidade em Data & Analytics
        </footer>
      </body>
    </html>
  );
}
