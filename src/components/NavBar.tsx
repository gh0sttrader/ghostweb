
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { GhostIcon } from "./GhostIcon";

const NavLinks = () => {
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
  );
};

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-black">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Logo only */}
        <div className="flex items-center">
          <Link href="/trading" className="flex items-center space-x-2">
            <GhostIcon className="h-6 w-6 text-primary" />
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
        <NavLinks />
      </div>
    </header>
  );
}
