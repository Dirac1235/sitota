'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ShieldCheck, Check, Gift } from 'lucide-react';

interface PageProps {
  params: Promise<{ recipientId: string }>;
}

export default function CollectAddressPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const recipientId = resolvedParams.recipientId;
  const router = useRouter();

  // Data State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [recipient, setRecipient] = useState<any>(null);
  const [sender, setSender] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  // Form State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/recipients/collect-address?id=${recipientId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve gifting records');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setRecipient(data.recipient);
          setSender(data.sender);
          setProduct(data.product);
          
          if (data.recipient.status !== 'AWAITING_ADDRESS' && data.recipient.status !== 'PENDING') {
            setSuccess(true);
          }
        } else {
          setError(data.error || 'Record error');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('The verification link is expired, invalid, or has already been fulfilled.');
        setLoading(false);
      });
  }, [recipientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/recipients/collect-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: recipientId,
          address: {
            street,
            city,
            state,
            postalCode,
            country,
          },
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setSubmitting(false);
      setError('A system error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EE] space-y-4">
        <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full animate-ping"></span>
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A] animate-pulse">
          Accessing Secure Gifting Vault...
        </span>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE] px-6">
        <div className="max-w-md w-full border border-[#8F9C86]/20 p-8 lg:p-12 space-y-6 bg-[#F5F1E6]/40 backdrop-blur-[2px] rounded-[2rem] shadow-sm">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D27D5B] block">
            SECURE SYSTEM // ERROR
          </span>
          <h1 className="font-serif text-4xl text-[#1F2B1A] uppercase tracking-tight leading-none">
            Fulfillment <br /><span className="italic font-light lowercase text-[#D27D5B]">blocked</span>
          </h1>
          <p className="text-xs font-sans text-[#1F2B1A]/70 uppercase tracking-widest leading-[2]">
            {error}
          </p>
          <div className="border-t border-[#8F9C86]/15 pt-6">
            <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono">
              ERR_CODE: SYS_GIFT_LINK_EXPIRED
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen relative flex flex-col lg:flex-row">
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0 z-20"></div>

      {success ? (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#FAF6EE] px-6 py-12">
          <div className="bg-[#F5F1E6]/40 backdrop-blur-[2px] border border-[#8F9C86]/20 p-8 lg:p-12 max-w-lg w-full relative shadow-2xl rounded-[2rem] space-y-8 animate-fade-in text-center">
            <div className="w-16 h-16 bg-[#8F9C86]/20 text-[#1F2B1A] rounded-full flex items-center justify-center mx-auto border border-[#8F9C86]/20">
              <Check className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D27D5B] block">
                VERIFICATION PORT // COMPLETED
              </span>
              <h3 className="font-serif text-3xl text-[#1F2B1A] uppercase tracking-tight leading-none">
                Details Secured
              </h3>
              <p className="text-xs font-sans text-[#1F2B1A]/70 uppercase tracking-widest leading-[2] max-w-sm mx-auto">
                Thank you, {recipient?.name}. Your shipping address has been securely verified and submitted to the fulfillment network for {sender?.companyName}.
              </p>
            </div>
            <div className="border-t border-[#8F9C86]/15 pt-6 text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40">
              LOGISTICS CONVERTED &bull; FULFILLMENT REGISTERED
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Left Panel - Elegant Presentation of the Sender & Gift */}
          <div className="w-full lg:w-1/2 bg-[#1F2B1A] text-[#FAF6EE] p-8 lg:p-24 flex flex-col justify-between relative overflow-hidden min-h-[50vh] lg:min-h-screen">
            {/* Grid effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(245,241,230,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,230,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                {sender?.logoUrl ? (
                  <img src={sender.logoUrl} alt={sender.companyName} className="h-10 object-contain grayscale" />
                ) : (
                  <span className="font-serif italic text-3xl text-[#FAF6EE] border-r border-[#FAF6EE]/30 pr-4">S.</span>
                )}
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#FAF6EE]/50 block">EXCLUSIVE GESTURE FROM</span>
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#FAF6EE]">{sender?.companyName}</span>
                </div>
              </div>

              <div className="space-y-4 pt-12">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D27D5B] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full animate-pulse"></span> A Curated Gift Awaits You
                </span>
                <h1 className="font-serif text-5xl lg:text-7xl uppercase tracking-tighter leading-none text-balance">
                  Ready for <br />
                  <span className="italic font-light lowercase text-[#D27D5B]">deployment</span>.
                </h1>
                <p className="text-xs uppercase tracking-[0.15em] text-[#FAF6EE]/70 max-w-md leading-[2] font-sans pt-4">
                  {sender?.companyName} has configured a premium {product?.name} especially for you. Provide your secure delivery parameters on the right to initiate courier transit.
                </p>
              </div>
            </div>

            {/* Product Mockup visual */}
            <div className="relative w-full max-w-sm aspect-square border border-[#8F9C86]/15 bg-[#FAF6EE]/5 p-4 z-10 mt-12 lg:mt-0 rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden">
              <img 
                src={product?.image} 
                alt={product?.name} 
                className="w-full h-full object-cover grayscale opacity-60 mix-blend-lighten scale-105" 
              />
              <div className="absolute top-4 left-4 border border-[#8F9C86]/15 bg-[#1F2B1A]/85 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.25em] font-bold">
                {product?.category}
              </div>
            </div>

            <div className="relative z-10 text-[9px] uppercase tracking-[0.25em] font-bold text-[#FAF6EE]/30 pt-12 lg:pt-0">
              SYS.05 // SECURE DESTINATION PORTAL
            </div>
          </div>

          {/* Right Panel - Verification Form */}
          <div className="w-full lg:w-1/2 bg-[#FAF6EE] p-8 lg:p-24 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[#8F9C86]/15 relative">
            <div className="max-w-md w-full mx-auto space-y-12">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D27D5B] block mb-3">
                  STATION 02 // SECURE ADDRESS LOG
                </span>
                <h2 className="font-serif text-4xl text-[#1F2B1A] uppercase tracking-tight leading-none mb-4">
                  Enter <span className="italic font-light lowercase text-[#D27D5B]">coordinates</span>
                </h2>
                <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/50 font-bold">
                  All courier endpoints are AES-256 encrypted. Senders only view completion logs, not physical addresses, if preferred.
                </p>
              </div>

              {recipient?.giftMessage && (
                <div className="border border-[#8F9C86]/20 p-6 bg-[#F5F1E6]/40 backdrop-blur-[1px] rounded-[1.5rem] relative">
                  <div className="absolute -top-2.5 left-4 bg-[#FAF6EE] px-2 text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50">
                    A Note From the Sender
                  </div>
                  <p className="font-serif italic text-base text-[#1F2B1A] leading-relaxed">
                    &ldquo;{recipient.giftMessage}&rdquo;
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                  <label className="block text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 transition-colors group-focus-within:text-[#D27D5B]">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="123 LUXURY WAY, APT 4B"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 transition-colors group-focus-within:text-[#D27D5B]">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="BEVERLY HILLS"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 transition-colors group-focus-within:text-[#D27D5B]">
                      State / Province
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="CA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 transition-colors group-focus-within:text-[#D27D5B]">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="90210"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 transition-colors group-focus-within:text-[#D27D5B]">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="UNITED STATES"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-[#1F2B1A] text-[#FAF6EE] text-[10px] tracking-[0.3em] uppercase font-bold rounded-full hover:bg-[#D27D5B] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md border border-transparent cursor-pointer"
                >
                  {submitting ? 'LOGGING COORDINATES...' : 'CONFIRM ADDRESS & DISPATCH'}
                </button>
              </form>

              <div className="flex items-center gap-2 justify-center text-[9px] uppercase tracking-[0.3em] font-bold text-[#1F2B1A]/40">
                <ShieldCheck className="w-4 h-4 text-[#8F9C86]" />
                ENCRYPTED SSL NODE DIRECTORY ACTIVE
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
