
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Ghost Trading Terminal',
  description: 'Ethereal Trading, Powered by AI.',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
