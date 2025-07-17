import { redirect } from 'next/navigation';

export default function TradingPage() {
  redirect('/trading-v2/dashboard');
  return null;
}
