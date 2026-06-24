import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './components/ClientLayout';

export const metadata: Metadata = {
  title: 'WanderWild - Discover Hidden Rural Treasures',
  description: 'Connect with local tourism providers worldwide - airlines, tour operators, hotels, and homestays. Experience authentic rural adventures with personalized itineraries.',
  keywords: ['rural tourism', 'travel', 'tourism', 'AI', 'chatbot', 'packages', 'adventure', 'homestays', 'local experiences'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
