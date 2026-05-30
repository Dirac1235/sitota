import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import SessionProvider from './components/SessionProvider';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const lato = Lato({ weight: ['300', '400', '700'], subsets: ['latin'], variable: '--font-lato' });

export const metadata: Metadata = {
  title: 'Sitota | Corporate Gifting',
  description: 'AI-powered luxury corporate gifting platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body className="font-sans bg-[#FDFBF7] text-[#1c1c1c] min-h-screen flex flex-col selection:bg-[#B89871] selection:text-white">
        <SessionProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
        </SessionProvider>
        <footer className="bg-[#111] text-white/70 py-16 mt-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <span className="font-serif text-2xl text-white block mb-4">Sitota</span>
              <p className="text-sm font-light max-w-xs leading-relaxed">
                Elevating corporate relationships through curated, personalized gifting experiences powered by AI.
              </p>
            </div>
            <div className="text-sm font-light space-y-2">
              <p className="uppercase tracking-widest text-xs text-white/50 mb-4 font-semibold">Platform</p>
              <p className="hover:text-white cursor-pointer transition-colors">Catalog</p>
              <p className="hover:text-white cursor-pointer transition-colors">Bundles</p>
              <p className="hover:text-white cursor-pointer transition-colors">How it works</p>
            </div>
            <div className="text-sm font-light space-y-2">
              <p className="uppercase tracking-widest text-xs text-white/50 mb-4 font-semibold">Contact</p>
              <p>hello@sitota.com</p>
              <p>+1 (800) 123-4567</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 mt-16 border-t border-white/10 text-xs tracking-wider flex justify-between">
            <p>&copy; {new Date().getFullYear()} Sitota. All rights reserved.</p>
            <div className="space-x-6">
              <span className="hover:text-white cursor-pointer">Privacy</span>
              <span className="hover:text-white cursor-pointer">Terms</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
