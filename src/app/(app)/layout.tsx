
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import { OpenPositionsProvider } from '@/contexts/OpenPositionsContext';
import { TradeHistoryProvider } from '@/contexts/TradeHistoryContext';
import { NavBar } from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Ghost Trading Terminal',
  description: 'Ethereal Trading, Powered by AI.',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <OpenPositionsProvider>
      <TradeHistoryProvider>
        <div className="flex flex-col h-screen w-full bg-background">
          <NavBar />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
        <Toaster />
      </TradeHistoryProvider>
    </OpenPositionsProvider>
  );
}
