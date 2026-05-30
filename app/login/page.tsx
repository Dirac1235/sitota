'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      window.location.href = callbackUrl;
    }
  }, [status, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setLoading(false);
      setError('Invalid email or password.');
    } else {
      // Redirect back to original page (e.g. checkout, catalog details)
      window.location.href = callbackUrl;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col border border-[#8F9C86]/20 bg-[#F5F1E6]/40 backdrop-blur-[2px] rounded-[2rem] relative z-10 reveal-text shadow-sm">
      
      {/* Frame Section */}
      <div className="p-8 lg:p-12 border-b border-[#8F9C86]/15 bg-[#FAF6EE]/50 rounded-t-[2rem]">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full"></span>
          SYS.04 // Identity Gate
        </span>
        <h1 className="font-serif text-4xl text-[#1F2B1A] uppercase tracking-tight leading-none mb-3">
          Welcome <span className="italic font-light lowercase text-[#D27D5B]">back</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.18em] text-[#1F2B1A]/60 font-bold">
          Sign in to access your bespoke dashboard.
        </p>
      </div>

      {error && (
        <div className="bg-[#D27D5B]/10 border-b border-[#8F9C86]/15 px-8 py-4 text-xs uppercase tracking-widest text-[#D27D5B] font-bold">
          🌿 {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8 bg-transparent">
        <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
          <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 transition-colors group-focus-within:text-[#D27D5B]">
            Email Address
          </label>
          <input
            type="email"
            required
            className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
            placeholder="ENTER YOUR REGISTERED EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
          <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 transition-colors group-focus-within:text-[#D27D5B]">
            Password
          </label>
          <input
            type="password"
            required
            className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
            placeholder="ENTER YOUR PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4.5 bg-[#1F2B1A] text-[#FAF6EE] text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-[#D27D5B] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {loading ? 'Verifying Identity...' : 'Authorize Access'}
        </button>
      </form>

      <div className="border-t border-[#8F9C86]/15 p-8 text-center bg-[#F5F1E6]/20 rounded-b-[2rem]">
        <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-semibold">
          New to the platform?{' '}
          <Link href="/register" className="font-bold text-[#1F2B1A] hover:text-[#D27D5B] transition-colors border-b border-[#1F2B1A]/30 pb-0.5 ml-2">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="w-full relative min-h-[80vh] flex flex-col justify-center items-center py-16 px-6">
      <Suspense fallback={
        <div className="min-h-[40vh] flex items-center justify-center bg-[#FAF6EE]">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A] animate-pulse">Initializing Identity Gate...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
      
      {/* Aesthetic cross-hair marker at the corner */}
      <div className="absolute right-12 bottom-12 hidden lg:flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A]/30">
        <span className="w-1.5 h-1.5 bg-[#8F9C86] rounded-full animate-pulse"></span>
        Workspace Connection Secured
      </div>
    </div>
  );
}
