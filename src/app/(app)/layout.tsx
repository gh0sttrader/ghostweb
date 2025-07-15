
import type {Metadata} from 'next';
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
    <div className="flex flex-col h-screen w-full">
      <NavBar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
