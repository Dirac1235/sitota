'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Search, Tag, MapPin, Phone, Mail, ShieldCheck, Check, Trash } from 'lucide-react';

interface Recipient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: any;
  tags: string[];
  createdAt: string;
}

export default function AddressBookPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Redirect if unauthenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/address-book');
    }
  }, [sessionStatus, router]);

  // States
  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [tagInput, setTagInput] = useState('Client'); // Default tag

  const fetchRecipients = async () => {
    try {
      const res = await fetch('/api/recipients');
      const data = await res.json();
      if (res.ok && data.recipients) {
        setRecipients(data.recipients);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchRecipients();
    }
  }, [sessionStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email: email || null,
          phone: phone || null,
          address: street ? {
            street,
            city,
            state,
            postalCode,
            country,
          } : null,
          tags: [tagInput],
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setSuccessMsg('Recipient securely logged.');
        // Clear fields
        setName('');
        setEmail('');
        setPhone('');
        setStreet('');
        setCity('');
        setState('');
        setPostalCode('');
        
        // Refresh contacts
        fetchRecipients();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.error || 'Fulfillment error');
      }
    } catch (err) {
      setSubmitting(false);
      setErrorMsg('A system error occurred. Please try again.');
    }
  };

  // Filter contacts by search query
  const filteredRecipients = recipients.filter((rec) => {
    const term = searchQuery.toLowerCase();
    return (
      rec.name.toLowerCase().includes(term) ||
      (rec.email && rec.email.toLowerCase().includes(term)) ||
      rec.tags.some(t => t.toLowerCase().includes(term))
    );
  });

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAE8E0] space-y-4">
        <span className="w-1.5 h-1.5 bg-[#9C3D2E] rounded-full animate-ping"></span>
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#0A0A0A] animate-pulse">
          Loading Directory Nodes...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative">
      <div className="w-full h-px bg-[#0A0A0A] animate-line-x absolute top-0"></div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#0A0A0A] pb-8 gap-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/60 hover:text-[#9C3D2E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" /> Back to Client Portal
            </Link>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#9C3D2E] block">
              SYS.04 // WORKSPACE DIRECTORY
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#0A0A0A] uppercase tracking-tight leading-none">
              Address <span className="italic font-light">Book</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/60 font-bold mt-2">
              Manage saved employee profiles, client addresses, and custom tags.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Panel: Register New Contact */}
          <div className="lg:col-span-5 border border-[#0A0A0A] bg-[#FAF9F5]/20 p-8 space-y-8 lg:sticky lg:top-28">
            <div>
              <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#9C3D2E] block mb-2">
                STATION 01 // DIRECTORY ENTRY
              </span>
              <h3 className="font-serif text-3xl uppercase tracking-tight text-[#0A0A0A]">
                Log <span className="italic font-light">Designee</span>
              </h3>
            </div>

            {successMsg && (
              <div className="border border-[#2C3625] bg-[#2C3625]/10 px-6 py-4 text-[9px] uppercase tracking-widest text-[#2C3625] font-bold flex items-center gap-2">
                <Check className="w-4 h-4 stroke-[2.5]" /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="border border-[#9C3D2E] bg-[#9C3D2E]/10 px-6 py-4 text-[9px] uppercase tracking-widest text-[#9C3D2E] font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative border-b border-[#0A0A0A] pb-1">
                  <label className="block text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/60 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                    placeholder="ALEX MORGAN"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="relative border-b border-[#0A0A0A] pb-1">
                  <label className="block text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/60 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                    placeholder="ALEX@COMPANY.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative border-b border-[#0A0A0A] pb-1">
                  <label className="block text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/60 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="relative border-b border-[#0A0A0A] pb-1">
                  <label className="block text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/60 mb-1">Cohort Tag</label>
                  <select
                    className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  >
                    <option value="Client" className="bg-[#EAE8E0] text-[#0A0A0A]">Client</option>
                    <option value="Employee" className="bg-[#EAE8E0] text-[#0A0A0A]">Employee</option>
                    <option value="Executive" className="bg-[#EAE8E0] text-[#0A0A0A]">Executive</option>
                    <option value="VIP" className="bg-[#EAE8E0] text-[#0A0A0A]">VIP Partner</option>
                  </select>
                </div>
              </div>

              {/* Optional Physical address logs */}
              <div className="space-y-4 pt-4 border-t border-[#0A0A0A]/10">
                <span className="block text-[7px] uppercase tracking-widest text-[#0A0A0A]/40 font-sans">
                  Physical Coordinates (Optional &bull; Can collect later)
                </span>

                <div className="relative border-b border-[#0A0A0A] pb-1">
                  <label className="block text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/60 mb-1">Street Address</label>
                  <input
                    type="text"
                    className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                    placeholder="123 LUXURY WAY, SUITE 400"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="relative border-b border-[#0A0A0A] pb-1">
                    <label className="block text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/60 mb-1">City</label>
                    <input
                      type="text"
                      className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                      placeholder="BEVERLY HILLS"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="relative border-b border-[#0A0A0A] pb-1">
                    <label className="block text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/60 mb-1">State</label>
                    <input
                      type="text"
                      className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                      placeholder="CA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="relative border-b border-[#0A0A0A] pb-1">
                    <label className="block text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/60 mb-1">Postal Code</label>
                    <input
                      type="text"
                      className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                      placeholder="90210"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <div className="relative border-b border-[#0A0A0A] pb-1">
                    <label className="block text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/60 mb-1">Country</label>
                    <input
                      type="text"
                      className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                      placeholder="UNITED STATES"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4.5 bg-[#0A0A0A] text-[#EAE8E0] text-[9px] tracking-[0.25em] uppercase font-bold hover:bg-[#9C3D2E] transition-colors duration-500 disabled:opacity-50 border border-[#0A0A0A] flex items-center justify-center gap-2"
              >
                <UserPlus className="w-3.5 h-3.5" /> {submitting ? 'LOGGING DESIGNEE...' : 'COMMIT TO DIRECTORY'}
              </button>
            </form>

            <div className="border-t border-[#0A0A0A]/10 pt-4">
              <span className="text-[7px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/30 block mb-2 font-sans">
                CSV MASS DEPLOYMENT SPECS
              </span>
              <p className="text-[8px] uppercase tracking-widest text-[#0A0A0A]/50 leading-relaxed font-mono">
                DURING CHECKOUT, CAMPAIGNS SUPPORT BULK LOADS VIA CSV. COLS REQUIRED: <br />
                <span className="text-[#0A0A0A] font-bold">First Name, Last Name, Email, Phone, Street, City, State, ZIP, Country, Message</span>
              </p>
            </div>
          </div>

          {/* Right Panel: Address List View */}
          <div className="lg:col-span-7 border border-[#0A0A0A] bg-[#FAF9F5]/10">
            {/* Search filter bar */}
            <div className="px-8 py-5 border-b border-[#0A0A0A] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF9F5]/40">
              <h3 className="font-serif text-2xl text-[#0A0A0A] uppercase tracking-tight leading-none flex-shrink-0">
                Directory Registry
              </h3>
              
              <div className="relative w-full md:max-w-xs flex items-center border border-[#0A0A0A]/20 px-3 py-1.5 bg-[#FAF9F5]/80">
                <Search className="w-3.5 h-3.5 text-[#0A0A0A]/40 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  className="w-full bg-transparent text-[9px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/30"
                  placeholder="SEARCH DIRECTORY..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* List Render */}
            {recipients.length === 0 ? (
              <div className="py-24 text-center px-6">
                <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/40 font-bold italic mb-2">
                  No directory records established.
                </p>
                <p className="text-[9px] uppercase tracking-widest text-[#0A0A0A]/30 max-w-xs mx-auto leading-relaxed">
                  Utilize the registration console on the left to populate your corporate workspace cohort.
                </p>
              </div>
            ) : filteredRecipients.length === 0 ? (
              <div className="py-24 text-center px-6">
                <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/40 font-bold italic">
                  No matches for &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#0A0A0A]/10">
                {filteredRecipients.map((rec) => {
                  const hasAddress = rec.address && (rec.address as any).street;
                  const addressObj = rec.address as any;
                  const formattedAddress = hasAddress
                    ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.postalCode}`
                    : null;

                  return (
                    <div key={rec.id} className="p-8 hover:bg-[#FAF9F5]/40 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3.5 flex-grow">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]">{rec.name}</span>
                          {rec.tags.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-0.5 border border-[#9C3D2E]/20 text-[6px] uppercase tracking-[0.2em] font-bold text-[#9C3D2E] bg-[#9C3D2E]/5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9px] uppercase tracking-widest font-bold text-[#0A0A0A]/50">
                          <div className="space-y-1.5">
                            {rec.email && (
                              <span className="flex items-center gap-1.5 text-stone-600">
                                <Mail className="w-3.5 h-3.5 stroke-[1.5] text-[#0A0A0A]/30" /> {rec.email}
                              </span>
                            )}
                            {rec.phone && (
                              <span className="flex items-center gap-1.5 text-stone-600">
                                <Phone className="w-3.5 h-3.5 stroke-[1.5] text-[#0A0A0A]/30" /> {rec.phone}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {formattedAddress ? (
                              <span className="flex items-start gap-1.5 text-stone-600 leading-normal">
                                <MapPin className="w-3.5 h-3.5 stroke-[1.5] text-[#9C3D2E]/60 flex-shrink-0" />
                                <span className="truncate max-w-xs">{formattedAddress}</span>
                              </span>
                            ) : (
                              <span className="text-[8px] uppercase tracking-widest text-[#9C3D2E] italic">
                                [ Address parameters missing ]
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
