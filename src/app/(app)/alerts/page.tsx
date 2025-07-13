"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlertsPage() {
    return (
        <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Moo Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is a placeholder page for alerts.</p>
                </CardContent>
            </Card>
        </main>
    );
}