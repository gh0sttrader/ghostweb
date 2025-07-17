
import { redirect } from 'next/navigation';

export default function GhostTradingPage() {
    redirect('/trading/dashboard');
    return null;
}
