
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Sora } from 'next/font/google';
import { NavBar } from '@/components/NavBar';
import { OpenPositionsProvider } from '@/contexts/OpenPositionsContext';
import { TradeHistoryProvider } from '@/contexts/TradeHistoryContext';
import { AlertsProvider } from '@/contexts/AlertsContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ghost Trading',
  description: 'Ethereal Trading, Powered by AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} dark`}>
      <body className="font-body antialiased bg-background">
        <OpenPositionsProvider>
          <TradeHistoryProvider>
            <AlertsProvider>
              <div className="flex flex-col h-screen w-full">
                <NavBar />
                <div className="flex-1 overflow-auto">
                  {children}
                </div>
              </div>
              <Toaster />
            </AlertsProvider>
          </TradeHistoryProvider>
        </OpenPositionsProvider>
      </body>
    </html>
  );
}
