'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-[#FDFBF7] sticky top-0 z-50 border-b border-[#1c1c1c]/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex-shrink-0">
              <span className="font-serif text-3xl text-[#1c1c1c] tracking-tight">Sitota.</span>
            </Link>
            <div className="hidden sm:flex space-x-8">
              <Link href="/catalog" className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1c1c1c]/60 hover:text-[#1c1c1c] transition-colors relative group py-2">
                Curated Catalog
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#1c1c1c] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-6">
            {session ? (
              <>
                <Link href="/dashboard" className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1c1c1c]/60 hover:text-[#1c1c1c] transition-colors">
                  Dashboard
                </Link>
                <span className="text-[11px] uppercase tracking-[0.15em] font-light text-[#1c1c1c]/50">
                  Hello, {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-5 py-2.5 border border-[#1c1c1c]/20 text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1c1c1c]/70 hover:border-[#1c1c1c] hover:text-[#1c1c1c] transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1c1c1c]/60 hover:text-[#1c1c1c] transition-colors">
                  Login
                </Link>
                <Link href="/register" className="px-5 py-2.5 border border-[#1c1c1c] text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#FDFBF7] transition-all duration-300">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
