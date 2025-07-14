
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={48}
    height={48}
    viewBox="0 0 48 48"
    fill="none"
    {...props}
  >
    <path
      d="M24 6c-10 0-16 7.5-16 18.5V40c0 1.5 2 1.5 2 0s2-2 4-2 4 2 4 2 2-2 4-2 4 2 4 2 2-2 4-2 4 2 4 2 2 0 2-1.5V24.5C40 13.5 34 6 24 6z"
      fill="#FFF"
      stroke="#FFF"
      strokeWidth="2"
    />
    <circle cx={18} cy={20} r={2} fill="#000" />
    <circle cx={30} cy={20} r={2} fill="#000" />
  </svg>
);


const NavLinks = () => {
  const pathname = usePathname();

  const links = [
    { href: "/trading", label: "GHOST TRADING" },
    { href: "/news", label: "NEWS" },
    { href: "/screener", label: "SCREENER" },
    { href: "/accounts", label: "ACCOUNTS" },
    { href: "/tradehistory", label: "TRADE HISTORY" },
  ];

  const isActive = (href: string) => {
    if (href === "/trading") {
      return pathname.startsWith("/trading");
    }
    return pathname.startsWith(href);
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
      <div className="flex h-12 items-center justify-between px-4 sm:px-6">
        {/* Left: Logo only */}
        <div className="flex items-center">
          <Link href="/trading" className="flex items-center space-x-2">
            <GhostIcon />
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
