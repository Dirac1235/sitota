'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-[#FAF6EE]/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#8F9C86]/10 w-full transition-all duration-300">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo and Menu Links */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex-shrink-0 group">
              <span className="font-serif italic text-4xl text-[#1F2B1A] tracking-tight pr-8 border-r border-[#8F9C86]/20 group-hover:text-[#D27D5B] transition-colors duration-500">
                Sitota.
              </span>
            </Link>
            <div className="hidden md:flex ml-8 space-x-8">
              <Link href="/catalog" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/70 hover:text-[#1F2B1A] transition-colors relative group py-2">
                Products
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D27D5B] transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/catalog/bundles" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/70 hover:text-[#1F2B1A] transition-colors relative group py-2">
                Gift Bundles
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D27D5B] transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/about" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/70 hover:text-[#1F2B1A] transition-colors relative group py-2">
                Our Story
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D27D5B] transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/how-it-works" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/70 hover:text-[#1F2B1A] transition-colors relative group py-2">
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D27D5B] transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4 md:space-x-8 h-full pl-6">
            {session ? (
              <div className="flex items-center h-full space-x-6 md:space-x-8">
                <Link href="/dashboard" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/70 hover:text-[#1F2B1A] transition-colors">
                  Workspace
                </Link>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#8F9C86] hidden sm:block">
                  🌳 {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-6 py-3 bg-[#1F2B1A] text-[#FAF6EE] text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-[#D27D5B] transition-colors duration-300 shadow-sm"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/70 hover:text-[#1F2B1A] transition-colors py-2 px-4 rounded-full">
                  Login
                </Link>
                <Link href="/register" className="px-6 py-3.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-300 shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}
