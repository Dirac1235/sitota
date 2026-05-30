'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError('Invalid email or password.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 lg:px-12 bg-[#FDFBF7]">
      <div className="max-w-md w-full border border-[#1c1c1c]/10 bg-white p-8 md:p-12 shadow-sm rounded-none">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl text-[#1c1c1c] tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-xs uppercase tracking-[0.15em] text-[#1c1c1c]/50 font-semibold">Sign in to your Sitota account</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded-none">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1c1c1c]/60 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-[#1c1c1c]/10 rounded-none bg-gray-50 focus:bg-white focus:outline-none focus:border-[#1c1c1c] text-sm transition-all duration-300"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] font-semibold text-[#1c1c1c]/60 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-[#1c1c1c]/10 rounded-none bg-gray-50 focus:bg-white focus:outline-none focus:border-[#1c1c1c] text-sm transition-all duration-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#1c1c1c] text-[#FDFBF7] text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#333] transition-colors duration-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#1c1c1c]/5 pt-6">
          <p className="text-sm text-[#1c1c1c]/60 font-light">
            New to Sitota?{' '}
            <Link href="/register" className="font-semibold text-[#1c1c1c] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
