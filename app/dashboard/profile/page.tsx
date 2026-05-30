'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { User, Mail, ShieldCheck, Check, ArrowLeft, Key, BellRing } from 'lucide-react';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Settings State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification States
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/profile');
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setLoading(false);
    }
  }, [sessionStatus, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      setSaving(false);
      return;
    }

    try {
      // Simulate profile sync for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile coordinates.');
    } finally {
      setSaving(false);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EE] space-y-4">
        <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-ping"></span>
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A] animate-pulse">
          Retrieving Profile Coordinates...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative animate-bloom">
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0"></div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#8F9C86]/15 pb-8 gap-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" /> Return to Client Portal
            </Link>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block">
              USER PROFILE CONTROL
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Profile <span className="italic font-light lowercase text-[#D27D5B]">settings</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold mt-2">
              Manage your personal identities, configure notification metrics, and change access codes.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Panel: Profile settings Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-12">
            
            {success && (
              <div className="border border-[#8F9C86]/30 bg-[#8F9C86]/10 px-8 py-5 text-xs uppercase tracking-widest text-[#1F2B1A] font-bold flex items-center gap-3 rounded-2xl shadow-inner animate-bloom">
                <Check className="w-4 h-4 stroke-[2.5] text-[#D27D5B]" /> Profile parameters synchronized successfully
              </div>
            )}

            {error && (
              <div className="border border-[#D27D5B]/30 bg-[#D27D5B]/10 px-8 py-5 text-xs uppercase tracking-widest text-[#D27D5B] font-bold rounded-2xl">
                🌿 {error}
              </div>
            )}

            {/* Profile Credentials */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-[#8F9C86]/15 pb-4">
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">01 /</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Identity Parameters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                  <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 group-focus-within:text-[#D27D5B]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                  <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 group-focus-within:text-[#D27D5B]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    disabled
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A]/40 focus:outline-none cursor-not-allowed"
                    value={email}
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-[#8F9C86]/15 pb-4">
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">02 /</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Access Security Codes</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                  <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 group-focus-within:text-[#D27D5B]">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full bg-transparent text-xs font-sans tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                  <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 group-focus-within:text-[#D27D5B]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full bg-transparent text-xs font-sans tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Notification preferences */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-[#8F9C86]/15 pb-4">
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">03 /</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Communication Metrics</h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-4 border border-[#8F9C86]/20 p-5 rounded-2xl bg-[#FAF6EE]/50 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#D27D5B] border-[#8F9C86]/40 cursor-pointer"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <div>
                    <span className="text-xs uppercase tracking-widest font-bold block text-[#1F2B1A]">Dispatch Alerts</span>
                    <span className="text-[10px] uppercase tracking-wider block text-[#1F2B1A]/50 mt-0.5">Receive transaction logs, gift approvals, and courier alerts</span>
                  </div>
                </label>

                <label className="flex items-center gap-4 border border-[#8F9C86]/20 p-5 rounded-2xl bg-[#FAF6EE]/50 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#D27D5B] border-[#8F9C86]/40 cursor-pointer"
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                  />
                  <div>
                    <span className="text-xs uppercase tracking-widest font-bold block text-[#1F2B1A]">Twilio Mobile Nodes</span>
                    <span className="text-[10px] uppercase tracking-wider block text-[#1F2B1A]/50 mt-0.5">Receive immediate SMS notifications when a recipient logs their address</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 disabled:opacity-50 shadow-md hover:shadow-lg cursor-pointer border-0"
            >
              {saving ? 'SYNCHRONIZING ACCOUNT...' : 'SAVE PROFILE PARAMETERS'}
            </button>

          </form>

          {/* Right Panel: Account visualizer */}
          <div className="lg:col-span-5 border border-[#8F9C86]/15 bg-[#F5F1E6]/30 p-8 space-y-8 rounded-[2rem] shadow-sm lg:sticky lg:top-28">
            <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block">COORDINATE VISUALIZER</span>

            <div className="aspect-square w-full border border-[#8F9C86]/10 bg-[#FAF6EE] relative overflow-hidden flex flex-col justify-between p-6 rounded-3xl">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(31,43,26,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(31,43,26,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

              <div 
                className="w-full h-full border flex flex-col items-center justify-center p-8 relative z-10 transition-all rounded-2xl shadow-inner bg-white/20 border-[#D27D5B]"
              >
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 border border-[#8F9C86]/10 rounded-full mx-auto bg-white flex items-center justify-center shadow-md p-3 relative overflow-hidden text-[#1F2B1A]">
                    <User className="w-10 h-10 text-[#D27D5B] stroke-[1.5]" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-serif text-2xl uppercase tracking-tight text-[#1F2B1A] truncate max-w-xs mx-auto">
                      {name || 'Account Node.'}
                    </h4>
                    <span 
                      className="text-[8px] uppercase tracking-[0.25em] font-bold px-3 py-1.5 text-[#FAF6EE] rounded-full shadow-sm bg-[#D27D5B]"
                    >
                      {email}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-[7px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono relative z-10 pt-4">
                NODE_SKU: CLIENT_IDENTITY_INDEX
              </div>
            </div>

            <p className="text-xs md:text-sm font-sans text-[#1F2B1A]/60 uppercase tracking-widest leading-[1.8] text-center font-semibold">
              Your profile coordinate is logged securely. Use this configuration to authenticate into your corporate workspaces.
            </p>

            <div className="flex items-center gap-2 justify-center text-[9px] uppercase tracking-[0.3em] font-bold text-[#1F2B1A]/40">
              <ShieldCheck className="w-4 h-4 text-[#8F9C86]" />
              SECURED CLIENT PROFILE ACTIVE
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
