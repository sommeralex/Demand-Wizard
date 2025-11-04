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
              <header className="bg-[#005A9C] text-white p-5 text-center text-2xl font-bold shadow-sm">
                Demand Wizard
              </header>
              <Stepper />
              <main className="flex-grow overflow-y-auto bg-white">
                {children}
              </main>
            </div>
          </WizardProvider>
        </ApiCacheProvider>
      </body>
    </html>
  );
}
