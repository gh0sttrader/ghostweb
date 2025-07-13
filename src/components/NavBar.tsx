"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GhostIcon } from "./GhostIcon";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/news", label: "NEWS" },
    { href: "/screener", label: "SCREENER" },
    { href: "/alerts", label: "MOO ALERTS" },
    { href: "/tradehistory", label: "TRADE HISTORY" },
  ];

  const isActive = (href: string, matchStartsWith = false) => {
    if (matchStartsWith) {
      return pathname.startsWith(href);
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            
            {/* Left: Logo and Brand */}
            <div className="flex items-center space-x-6 text-sm font-medium">
                <Link href="/trading" className="mr-6 flex items-center space-x-2">
                    <GhostIcon className="h-6 w-6 text-primary" />
                    <span className={cn(
                        "font-bold hidden sm:inline-block transition-colors",
                        isActive("/trading", true) ? "text-foreground" : "text-foreground/60 hover:text-foreground/80"
                    )}>
                        GHOST TRADING
                    </span>
                </Link>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 flex justify-center px-4">
                <div className="relative w-full max-w-md">
                    <Input
                        placeholder="Search..."
                        className="h-9 w-full pl-8 rounded-full"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
            </div>
            
            {/* Right: Nav Links */}
            <nav className="flex items-center space-x-6 text-sm font-medium">
                {links.map((link) => (
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
                ))}
            </nav>
        </div>
    </header>
  );
}
