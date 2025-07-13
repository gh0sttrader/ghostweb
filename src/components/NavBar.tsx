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
    { href: "/trading", label: "GHOST TRADING", matchStartsWith: true },
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
        <div className="flex h-14 items-center px-4 sm:px-6">
            <nav className="flex items-center space-x-6 text-sm font-medium w-full">
                <Link href="/trading" className="mr-6 flex items-center space-x-2">
                    <GhostIcon className="h-6 w-6 text-primary" />
                    <span className="font-bold hidden sm:inline-block">GHOST TRADING</span>
                </Link>

                <div className="flex-1 flex items-center gap-6">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                isActive(link.href, link.matchStartsWith) ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="relative w-full max-w-xs ml-auto">
                    <Input
                        placeholder="Search..."
                        className="h-9 w-full pl-8 rounded-full"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
            </nav>
        </div>
    </header>
  );
}
