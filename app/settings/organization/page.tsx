'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Building2, Palette, Upload, ShieldCheck, Check, ArrowLeft } from 'lucide-react';

export default function OrganizationSettings() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Redirect if unauthenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/settings/organization');
    }
  }, [sessionStatus, router]);

  // Settings State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [orgName, setOrgName] = useState('');
  const [brandColor, setBrandColor] = useState('#9C3D2E');
  const [logoUrl, setLogoUrl] = useState('');
  const [billingPlan, setBillingPlan] = useState('FREE');
  const [role, setRole] = useState('STANDARD_USER');

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetch('/api/organization')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.organization) {
            setOrgName(data.organization.name);
            setBrandColor(data.organization.brandColor || '#9C3D2E');
            setLogoUrl(data.organization.logoUrl || '');
            setBillingPlan(data.organization.billingPlan);
            setRole(data.role);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [sessionStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orgName,
          brandColor,
          logoUrl,
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to update workspace');
      }
    } catch (err) {
      setSaving(false);
      setError('A system error occurred. Please try again.');
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EE] space-y-4">
        <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-ping"></span>
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A] animate-pulse">
          Loading Workspace Directory...
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
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" /> Back to Portal
            </Link>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block">
              SYS.03 // WORKSPACE DIRECTORY
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Workspace <span className="italic font-light lowercase text-[#D27D5B]">settings</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold mt-2">
              Configure company variables, set default logo vectors, and pick corporate palettes.
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="px-5 py-3 border border-[#8F9C86]/20 text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/60 bg-[#FAF9F5]/40 rounded-full font-mono">
              Role: {role}
            </span>
            <span className="px-5 py-3 bg-[#1F2B1A] text-[#FAF6EE] text-xs uppercase tracking-[0.2em] font-bold rounded-full border border-transparent shadow-sm">
              Plan: {billingPlan}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Panel: Form Settings */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-12">
            
            {success && (
              <div className="border border-[#8F9C86]/30 bg-[#8F9C86]/10 px-8 py-5 text-xs uppercase tracking-widest text-[#1F2B1A] font-bold flex items-center gap-3 rounded-2xl shadow-inner animate-bloom">
                <Check className="w-4 h-4 stroke-[2.5] text-[#D27D5B]" /> Workspace parameters synchronized successfully
              </div>
            )}

            {error && (
              <div className="border border-[#D27D5B]/30 bg-[#D27D5B]/10 px-8 py-5 text-xs uppercase tracking-widest text-[#D27D5B] font-bold rounded-2xl">
                🌿 {error}
              </div>
            )}

            {/* Section 1 // Corporate Entity */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-[#8F9C86]/15 pb-4">
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">01 /</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Corporate Entity Details</h3>
              </div>
              
              <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 transition-colors group-focus-within:text-[#D27D5B]">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                  placeholder="ENTER COMPANY NAME"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
            </div>

            {/* Section 2 // Brand Identity Swatches */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-[#8F9C86]/15 pb-4">
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">02 /</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Brand Identity Assets</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Brand Color Input */}
                <div className="space-y-4">
                  <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50">
                    Primary Brand Color
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      className="w-12 h-12 border border-[#8F9C86]/30 rounded-xl bg-transparent cursor-pointer p-1"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                    />
                    <div className="relative border-b border-[#8F9C86]/30 pb-1 flex-grow focus-within:border-[#D27D5B]">
                      <input
                        type="text"
                        className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Brand Vector URL */}
                <div className="relative border-b border-[#8F9C86]/30 pb-2 group justify-end focus-within:border-[#D27D5B]">
                  <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 transition-colors group-focus-within:text-[#D27D5B]">
                    Corporate Logo (Vector/PNG URL)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="HTTPS://DOMAIN.COM/LOGO.PNG"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {saving ? 'SYNCHRONIZING WORKSPACE...' : 'SAVE WORKSPACE PARAMETERS'}
            </button>

          </form>

          {/* Right Panel: Live Mockup Workstation */}
          <div className="lg:col-span-5 border border-[#8F9C86]/15 bg-[#F5F1E6]/30 p-8 space-y-8 rounded-[2rem] shadow-sm lg:sticky lg:top-28">
            <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block">
              WORKSPACE MOCKUP // DYNAMIC PREVIEW
            </span>

            {/* Dynamic Product Visual Box */}
            <div className="aspect-square w-full border border-[#8F9C86]/10 bg-[#FAF6EE] relative overflow-hidden flex flex-col justify-between p-6 rounded-3xl">
              {/* Grid backdrop overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(31,43,26,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(31,43,26,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

              {/* Box container visual styled with Organization Brand Color */}
              <div 
                className="w-full h-full border flex flex-col items-center justify-center p-8 relative z-10 transition-colors duration-500 rounded-2xl shadow-inner bg-white/20"
                style={{ borderColor: brandColor }}
              >
                <div className="text-center space-y-6">
                  {/* Dynamic Logo Container */}
                  <div className="w-20 h-20 border border-[#8F9C86]/10 rounded-full mx-auto bg-white flex items-center justify-center shadow-sm p-3 relative overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Preview Logo" className="w-full h-full object-contain grayscale" />
                    ) : (
                      <Building2 className="w-8 h-8 text-[#1F2B1A]/30" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-serif text-2xl uppercase tracking-tight text-[#1F2B1A] truncate max-w-xs mx-auto">
                      {orgName || 'Workspace.'}
                    </h4>
                    <span 
                      className="text-[8px] uppercase tracking-[0.25em] font-bold px-3 py-1.5 text-[#FAF6EE] rounded-full transition-colors duration-500 shadow-sm"
                      style={{ backgroundColor: brandColor }}
                    >
                      Default Brand Color
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-[7px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono relative z-10 pt-4">
                MOCK_SKU: BNDL_IDENTITY_PACK
              </div>
            </div>

            <p className="text-xs md:text-sm font-sans text-[#1F2B1A]/60 uppercase tracking-widest leading-[1.8] text-center font-semibold">
              This layout demonstrates how the default branding is deployed to customizable gift canvases inside the index.
            </p>

            <div className="flex items-center gap-2 justify-center text-[9px] uppercase tracking-[0.3em] font-bold text-[#1F2B1A]/40">
              <ShieldCheck className="w-4 h-4 text-[#8F9C86]" />
              SECURED CLIENT NODE ACTIVE
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
