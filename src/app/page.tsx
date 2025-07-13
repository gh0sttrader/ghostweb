"use client";

import { redirect } from 'next/navigation';

export default function LandingPage() {
  // Redirect to the new default page for the trading terminal
  redirect('/trading/dashboard');
  
  // The content below is not rendered due to the redirect.
  // It is safe to remove or keep for future reference.
  return null;
}
