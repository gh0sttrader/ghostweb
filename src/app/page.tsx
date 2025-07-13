import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, LineChart, PieChart, User } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <a className="flex items-center justify-center gap-2" href="#">
          <GhostIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">Ghost Trading</span>
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
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Trade Beyond the Veil
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Harness the power of AI to navigate the markets with Ghost Trading. Ethereal insights, tangible results.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Launch Terminal
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
              <Image
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                height="600"
                src="https://placehold.co/600x600.png"
                data-ai-hint="abstract purple"
                width="600"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ethereal Intelligence, Real-World Gains</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides the tools you need to analyze market trends, generate trading strategies, and manage your portfolio with unparalleled precision.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI-Powered Strategies</CardTitle>
                  <BrainCircuit className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Generate and backtest complex trading strategies using our advanced AI.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Real-Time Market Analysis</CardTitle>
                  <LineChart className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Stay ahead of the market with AI-summarized news and real-time data feeds.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Insights</CardTitle>
                  <PieChart className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Gain a deeper understanding of your assets with our comprehensive portfolio analysis.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Ghost Trading. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
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
      viewBox="0 0 24 24"
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
