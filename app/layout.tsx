import type { Metadata } from 'next';
import { Cormorant, Manrope } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import SessionProvider from './components/SessionProvider';
import Link from 'next/link';

const cormorant = Cormorant({ 
  weight: ['300', '400', '500', '600', '700'], 
  subsets: ['latin'], 
  variable: '--font-cormorant' 
});

const manrope = Manrope({ 
  weight: ['200', '300', '400', '500', '600', '700', '800'], 
  subsets: ['latin'], 
  variable: '--font-manrope' 
});

export const metadata: Metadata = {
  title: 'Sitota | Corporate Gifting',
  description: 'Unforgettable, personalized gifts and bespoke curated campaigns designed with botanical grace and warm elegance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="font-sans bg-[#FAF6EE] text-[#1F2B1A] min-h-screen flex flex-col selection:bg-[#D27D5B] selection:text-[#FAF6EE] noise-bg">
        <SessionProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
        </SessionProvider>
        <footer className="bg-[#1F2B1A] text-[#FAF6EE] border-t border-[#8F9C86]/20 py-16 mt-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-[#FAF6EE]/10 pb-16">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <span className="font-serif italic text-5xl block text-[#FAF6EE]">Sitota.</span>
              <p className="font-sans text-[11px] uppercase tracking-widest leading-loose max-w-sm opacity-60">
                Nurturing corporate relationships through beautifully crafted, natural, and personalized gifting experiences.
              </p>
            </div>
            <div className="font-sans text-[10px] uppercase tracking-widest space-y-4">
              <p className="text-[#D27D5B] font-bold mb-6">Platform</p>
              <Link href="/catalog" className="hover:text-[#D27D5B] transition-colors duration-300 block">Curated Index</Link>
              <Link href="/about" className="hover:text-[#D27D5B] transition-colors duration-300 block">Our Story</Link>
              <Link href="/how-it-works" className="hover:text-[#D27D5B] transition-colors duration-300 block">How It Works</Link>
            </div>
            <div className="font-sans text-[10px] uppercase tracking-widest space-y-4">
              <p className="text-[#D27D5B] font-bold mb-6">Connect</p>
              <p className="hover:text-[#D27D5B] cursor-pointer transition-colors duration-300">studio@sitota.com</p>
              <p className="hover:text-[#D27D5B] cursor-pointer transition-colors duration-300">+1 (800) 123-4567</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-widest opacity-50">
            <p>&copy; {new Date().getFullYear()} Sitota. Crafted with botanical grace.</p>
            <div className="space-x-8 mt-4 md:mt-0">
              <span className="hover:text-[#D27D5B] cursor-pointer transition-colors">Privacy Charter</span>
              <span className="hover:text-[#D27D5B] cursor-pointer transition-colors">Terms of Harmony</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
