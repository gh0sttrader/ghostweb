
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import { OpenPositionsProvider } from '@/contexts/OpenPositionsContext';
import { TradeHistoryProvider } from '@/contexts/TradeHistoryContext';

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
        {children}
        <Toaster />
      </TradeHistoryProvider>
    </OpenPositionsProvider>
  );
}
