
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/trading", label: "GHOST TRADING" },
    { href: "/news", label: "NEWS" },
    { href: "/screener", label: "SCREENER" },
    { href: "/tradehistory", label: "TRADE HISTORY" },
  ];

  const isActive = (href: string) => {
    if (href === "/trading") {
      return pathname.startsWith("/trading");
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black">
      <div className="flex h-12 items-center justify-between px-4 sm:px-6">
        {/* Left: Logo only */}
        <div className="flex items-center">
          <Link href="/trading" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="h-6 w-6 text-primary"
            >
              <path d="M128,24A104,104,0,0,0,24,128v88a16,16,0,0,0,16,16H80a16,16,0,0,0,16-16V216a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16v8a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V128A104,104,0,0,0,128,24Zm40,120a16,16,0,1,1,16-16A16,16,0,0,1,168,144Zm-64,0a16,16,0,1,1,16-16A16,16,0,0,1,104,144Z" />
            </svg>
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
        <nav className="flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive(link.href) ? "text-foreground" : "text-foreground/60",
                link.href === "/trading" ? "font-bold" : ""
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
