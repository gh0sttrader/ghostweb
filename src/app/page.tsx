
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <a className="flex items-center justify-center gap-2" href="#">
          <GhostIcon className="h-6 w-6 text-primary" />
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">User Profile</span>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  Trade Beyond the Veil
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Harness the power of AI to navigate the markets with Ghost Trading. Ethereal insights, tangible results.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/trading/dashboard">
                  <Button size="lg">Launch Terminal</Button>
                </Link>
                <Button size="lg" variant="secondary">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function GhostIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 21l3 3V10a8 8 0 0 0-8-8z" />
    </svg>
  )
}
