
"use client";

import type {Metadata} from 'next';
import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { cn } from '@/lib/utils';

// Metadata is now defined in the RootLayout, but we can keep this here
// if we want to override it on a per-layout basis.
// export const metadata: Metadata = {
//   title: 'Ghost Trading Terminal',
//   description: 'Ethereal Trading, Powered by AI.',
// };

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isTradingV2 = pathname.startsWith('/trading-v2');

  return (
    <div className="flex flex-col h-screen w-full">
      <NavBar />
      <div className={cn("flex-1 overflow-auto", isTradingV2 && "h-full")}>
        {children}
      </div>
    </div>
  );
}
