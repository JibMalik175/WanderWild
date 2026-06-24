'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingChatButton from './FloatingChatButton';
import PageTransition from './PageTransition';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Pages where navbar and footer should be hidden
  const hideNavbarFooter = pathname === '/login' || pathname === '/register';

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <main className="flex-1">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      {!hideNavbarFooter && <Footer />}
      <FloatingChatButton />
    </>
  );
}
