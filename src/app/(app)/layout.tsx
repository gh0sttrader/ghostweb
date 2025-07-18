"use client";

import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isTradingV2 = pathname.startsWith('/trading-v2');

  return (
    <div className="flex flex-col h-screen w-full">
      {!isTradingV2 && <NavBar />}
      <div className={cn("flex-1 overflow-auto", isTradingV2 && "h-full")}>
        {children}
      </div>
    </div>
  );
}
