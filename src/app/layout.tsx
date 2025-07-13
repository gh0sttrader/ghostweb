
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { OpenPositionsProvider } from '@/contexts/OpenPositionsContext';
import { TradeHistoryProvider } from '@/contexts/TradeHistoryContext';

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <OpenPositionsProvider>
          <TradeHistoryProvider>
            {children}
            <Toaster />
          </TradeHistoryProvider>
        </OpenPositionsProvider>
      </body>
    </html>
  );
}
