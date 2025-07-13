import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/trading/dashboard');
  return null;
}
