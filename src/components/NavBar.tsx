
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";

const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ghost Trading Logo"
      {...props}
    >
      <path d="M20 4C12 4 6 10 6 18v10c0 2 1 3 3 3s2-1 4-1 3 1 5 1 3-1 5-1 3 1 5 1c2 0 3-1 3-3V18c0-8-6-14-14-14zM14 20a2 2 0 110-4 2 2 0 010 4zm12 0a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
};

const AppNavLinks = () => {
  const pathname = usePathname();

  const links = [
    { href: "/trading-v2/dashboard", label: "GHOST TRADING" },
    { href: "/trading/dashboard", label: "TRADE" },
    { href: "/accounts", label: "DASHBOARD" },
    { href: "/news", label: "NEWS" },
    { href: "/screener", label: "ALERT CENTER" },
    { href: "/tradehistory", label: "TRADE HISTORY" },
    { href: "/settings", label: "SETTINGS" },
  ];

  const isActive = (href: string) => {
    if (href === "/trading/dashboard") {
      // Special check for the main portal button to also be active for dashboard
      return pathname.startsWith("/trading/dashboard") || pathname.startsWith("/ghosttrading");
    }
    // For other links, check if the pathname starts with the href.
    // This correctly handles nested routes.
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
      {links.map((link) => {
          if (link.label === 'GHOST TRADING') {
              return (
                  <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "transition-colors hover:text-foreground/80 font-bold tracking-wider",
                        isActive(link.href) ? "text-foreground" : "text-foreground/60"
                      )}
                  >
                      {link.label}
                  </Link>
              );
          }
          return (
              <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                      "transition-colors hover:text-foreground/80",
                      isActive(link.href) ? "text-foreground" : "text-foreground/60"
                  )}
              >
                  {link.label}
              </Link>
          );
      })}
    </nav>
  );
};

const HomepageNavLinks = ({ onReviewClick }: { onReviewClick: () => void }) => {
    const links = [
        { href: "#", label: "Login" },
        { href: "#", label: "Sign up" },
    ];

    return (
        <nav className="flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
            {links.map((link) => (
                <span
                    key={link.label}
                    className="text-foreground/80 cursor-not-allowed"
                >
                    {link.label}
                </span>
            ))}
             <button
                onClick={onReviewClick}
                className="text-foreground/80 hover:text-foreground transition-colors"
            >
                Review
            </button>
        </nav>
    );
};

export function NavBar({ onReviewClick }: { onReviewClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/trading/dashboard?ticker=${searchQuery.toUpperCase()}`);
    }
  };

  const isHomepage = pathname === '/';
  const isTradingV2 = pathname.startsWith('/trading-v2');

  // Do not render the full bar on the V2 trading page, only the logo part.
  if (isTradingV2) {
    return (
       <header className="sticky top-0 z-50 w-full bg-black h-12 flex items-center px-8 sm:px-12">
           <Link href="/accounts" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                <GhostIcon className="h-8 w-8" />
           </Link>
       </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-black">
      <div className="flex h-16 items-center justify-between px-8 sm:px-12">
        <div className="flex items-center">
          <Link href="/accounts" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <GhostIcon className="h-8 w-8" />
          </Link>
        </div>

        {mounted && (
          <>
            {!isHomepage && (
              <div className="flex-1 flex justify-center px-4">
                <div className="relative w-full max-w-md">
                  <Input
                    placeholder="Search ticker (e.g., AAPL, QTUM)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="h-9 w-full pl-8 rounded-full"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
            
            {isHomepage && onReviewClick ? <HomepageNavLinks onReviewClick={onReviewClick} /> : <AppNavLinks />}
          </>
        )}
      </div>
    </header>
  );
}
