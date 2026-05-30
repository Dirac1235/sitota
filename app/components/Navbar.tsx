'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

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
              <div 
                className="relative h-full flex items-center"
                onMouseLeave={closeDropdown}
              >
                {/* Trigger Button: User Name + Chevron */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-extrabold text-[#1F2B1A]/80 hover:text-[#D27D5B] transition-all focus:outline-none cursor-pointer py-3 px-4 border border-[#8F9C86]/20 bg-[#FAF9F5] rounded-full shadow-sm hover:shadow-md"
                >
                  <span className="max-w-[150px] truncate">
                    🌳 {session.user?.name || session.user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-[#D27D5B]' : ''}`} />
                </button>

                {/* Dropdown Menu Panel */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-16 w-56 bg-[#FAF6EE] border border-[#8F9C86]/20 rounded-2xl shadow-xl py-3 z-50 animate-fade-in flex flex-col">
                    <span className="px-5 pb-2 border-b border-[#8F9C86]/10 text-[8px] uppercase tracking-widest font-bold text-[#1F2B1A]/40 block select-none">
                      Workspace Navigation
                    </span>
                    
                    <Link 
                      href="/dashboard" 
                      onClick={closeDropdown}
                      className="px-5 py-3 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] text-xs uppercase tracking-wider font-extrabold text-[#1F2B1A]/80 transition-colors flex items-center gap-3"
                    >
                      <LayoutDashboard className="w-4 h-4 opacity-70" /> Workspace Portal
                    </Link>

                    <Link 
                      href="/dashboard/profile" 
                      onClick={closeDropdown}
                      className="px-5 py-3 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] text-xs uppercase tracking-wider font-extrabold text-[#1F2B1A]/80 transition-colors flex items-center gap-3"
                    >
                      <User className="w-4 h-4 opacity-70" /> Profile Settings
                    </Link>

                    <Link 
                      href="/dashboard?tab=settings" 
                      onClick={closeDropdown}
                      className="px-5 py-3 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] text-xs uppercase tracking-wider font-extrabold text-[#1F2B1A]/80 transition-colors flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4 opacity-70" /> Workspace Settings
                    </Link>

                    <div className="border-t border-[#8F9C86]/10 mt-2 pt-2">
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full text-left px-5 py-3 hover:bg-[#D27D5B] hover:text-[#FAF6EE] text-xs uppercase tracking-wider font-extrabold text-[#D27D5B] transition-colors flex items-center gap-3 border-0 bg-transparent cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 opacity-70" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
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
