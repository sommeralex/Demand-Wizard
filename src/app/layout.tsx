import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WizardProvider } from './context/WizardContext';
import { ApiCacheProvider } from './context/ApiCacheContext';
import { I18nProvider } from '../context/I18nContext';
import { Stepper } from './components/Stepper';
import LanguageSwitcher from './components/LanguageSwitcher';
import Footer from '../components/Footer';

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
          <I18nProvider>
            <WizardProvider>
              <div className="flex flex-col h-screen">
                <header className="bg-[#005A9C] text-white p-4 shadow-sm flex items-center justify-between">
                  <div className="flex-1"></div>
                  <h1 className="text-2xl font-bold flex-1 text-center">Demand Wizard</h1>
                  <div className="flex-1 flex justify-end">
                    <LanguageSwitcher />
                  </div>
                </header>
                <Stepper />
                <main className="flex-grow overflow-y-auto bg-white">
                  {children}
                </main>
                <Footer />
              </div>
            </WizardProvider>
          </I18nProvider>
        </ApiCacheProvider>
      </body>
    </html>
  );
}
