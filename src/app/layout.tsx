import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WizardProvider } from './context/WizardContext';
import { ApiCacheProvider } from './context/ApiCacheContext';
import { Stepper } from './components/Stepper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Demand Management Wizard",
  description: "A 5-step wizard to validate and process ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <ApiCacheProvider>
          <WizardProvider>
            <div className="flex flex-col h-screen">
              <header className="bg-gray-800 text-white p-4 text-center text-2xl font-bold">
                AI Based Demand Wizard
              </header>
              <Stepper />
              <main className="flex-grow overflow-y-auto">
                {children}
              </main>
            </div>
          </WizardProvider>
        </ApiCacheProvider>
      </body>
    </html>
  );
}
