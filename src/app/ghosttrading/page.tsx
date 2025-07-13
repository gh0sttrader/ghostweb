
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function GhostTradingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <h1 className="text-4xl font-bold mb-4">Trading Terminal</h1>
            <p className="text-muted-foreground mb-8">This is a placeholder for the main trading interface.</p>
            <Link href="/trading/dashboard">
                <Button>Go to Dashboard</Button>
            </Link>
        </div>
    );
}
