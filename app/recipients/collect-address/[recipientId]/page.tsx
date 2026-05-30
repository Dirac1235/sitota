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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAE8E0] space-y-4">
        <span className="w-1.5 h-1.5 bg-[#9C3D2E] rounded-full animate-ping"></span>
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#0A0A0A] animate-pulse">
          Accessing Secure Gifting Vault...
        </span>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAE8E0] px-6">
        <div className="max-w-md w-full border border-[#0A0A0A] p-8 lg:p-12 space-y-6 bg-[#FAF9F5]/40 backdrop-blur-[2px]">
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#9C3D2E] block">
            SECURE SYSTEM // ERROR
          </span>
          <h1 className="font-serif text-4xl text-[#0A0A0A] uppercase tracking-tight leading-none">
            Fulfillment <br /><span className="italic font-light">Blocked</span>
          </h1>
          <p className="text-[11px] font-sans text-[#0A0A0A]/70 uppercase tracking-widest leading-[2]">
            {error}
          </p>
          <div className="border-t border-[#0A0A0A]/20 pt-6">
            <span className="text-[8px] uppercase tracking-widest text-[#0A0A0A]/40 font-mono">
              ERR_CODE: SYS_GIFT_LINK_EXPIRED
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen relative flex flex-col lg:flex-row">
      <div className="w-full h-px bg-[#0A0A0A] animate-line-x absolute top-0 z-20"></div>

      {success ? (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#EAE8E0] px-6 py-12">
          <div className="bg-[#FAF9F5]/40 backdrop-blur-[2px] border border-[#0A0A0A] p-8 lg:p-12 max-w-lg w-full relative shadow-2xl space-y-8 animate-fade-in text-center">
            <div className="w-16 h-16 bg-[#2C3625] text-[#EAE8E0] rounded-full flex items-center justify-center mx-auto border border-[#0A0A0A]">
              <Check className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-4">
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#9C3D2E] block">
                VERIFICATION PORT // COMPLETED
              </span>
              <h3 className="font-serif text-3xl text-[#0A0A0A] uppercase tracking-tight leading-none">
                Details Secured
              </h3>
              <p className="text-[11px] font-sans text-[#0A0A0A]/70 uppercase tracking-widest leading-[2] max-w-sm mx-auto">
                Thank you, {recipient?.name}. Your shipping address has been securely verified and submitted to the fulfillment network for {sender?.companyName}.
              </p>
            </div>
            <div className="border-t border-[#0A0A0A]/15 pt-6 text-[8px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/40">
              LOGISTICS CONVERTED &bull; FULFILLMENT REGISTERED
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Left Panel - Elegant Presentation of the Sender & Gift */}
          <div className="w-full lg:w-1/2 bg-[#0A0A0A] text-[#EAE8E0] p-8 lg:p-24 flex flex-col justify-between relative overflow-hidden min-h-[50vh] lg:min-h-screen">
            {/* Grid effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(234,232,224,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(234,232,224,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                {sender?.logoUrl ? (
                  <img src={sender.logoUrl} alt={sender.companyName} className="h-10 object-contain grayscale" />
                ) : (
                  <span className="font-serif italic text-3xl text-[#EAE8E0] border-r border-[#EAE8E0]/30 pr-4">S.</span>
                )}
                <div>
                  <span className="text-[7px] uppercase tracking-[0.25em] text-[#EAE8E0]/50 block">EXCLUSIVE GESTURE FROM</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#EAE8E0]">{sender?.companyName}</span>
                </div>
              </div>

              <div className="space-y-4 pt-12">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#9C3D2E] flex items-center gap-2">
                  <Gift className="w-3 h-3 text-[#9C3D2E]" /> A Curated Gift Awaits You
                </span>
                <h1 className="font-serif text-5xl lg:text-7xl uppercase tracking-tighter leading-none text-balance">
                  Ready for <br />
                  <span className="italic font-light">Deployment</span>.
                </h1>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#EAE8E0]/70 max-w-md leading-[2] font-sans pt-4">
                  {sender?.companyName} has configured a premium {product?.name} especially for you. Provide your secure delivery parameters on the right to initiate courier transit.
                </p>
              </div>
            </div>

            {/* Product Mockup visual */}
            <div className="relative w-full max-w-sm aspect-square border border-[#EAE8E0]/15 bg-[#EAE8E0]/5 p-4 z-10 mt-12 lg:mt-0 shadow-2xl flex items-center justify-center overflow-hidden">
              <img 
                src={product?.image} 
                alt={product?.name} 
                className="w-full h-full object-cover grayscale opacity-60 mix-blend-lighten scale-105" 
              />
              <div className="absolute top-4 left-4 border border-[#EAE8E0]/15 bg-[#0A0A0A]/80 px-3 py-1 text-[7px] uppercase tracking-[0.25em] font-bold">
                {product?.category}
              </div>
            </div>

            <div className="relative z-10 text-[8px] uppercase tracking-[0.25em] font-bold text-[#EAE8E0]/30 pt-12 lg:pt-0">
              SYS.05 // SECURE DESTINATION PORTAL
            </div>
          </div>

          {/* Right Panel - Verification Form */}
          <div className="w-full lg:w-1/2 bg-[#EAE8E0] p-8 lg:p-24 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[#0A0A0A]">
            <div className="max-w-md w-full mx-auto space-y-12">
              <div>
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#9C3D2E] block mb-3">
                  STATION 02 // SECURE ADDRESS LOG
                </span>
                <h2 className="font-serif text-4xl text-[#0A0A0A] uppercase tracking-tight leading-none mb-4">
                  Enter <span className="italic font-light">Coordinates</span>
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/50 font-bold">
                  All courier endpoints are AES-256 encrypted. Senders only view completion logs, not physical addresses, if preferred.
                </p>
              </div>

              {recipient?.giftMessage && (
                <div className="border border-[#0A0A0A]/20 p-6 bg-[#FAF9F5]/40 backdrop-blur-[1px] relative">
                  <div className="absolute -top-2.5 left-4 bg-[#EAE8E0] px-2 text-[7px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/50">
                    A Note From the Sender
                  </div>
                  <p className="font-serif italic text-base text-[#0A0A0A] leading-relaxed">
                    &ldquo;{recipient.giftMessage}&rdquo;
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative border-b border-[#0A0A0A] pb-2 group">
                  <label className="block text-[8px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/60 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-transparent text-[11px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                    placeholder="123 LUXURY WAY, APT 4B"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative border-b border-[#0A0A0A] pb-2">
                    <label className="block text-[8px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/60 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-[11px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                      placeholder="BEVERLY HILLS"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="relative border-b border-[#0A0A0A] pb-2">
                    <label className="block text-[8px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/60 mb-2">
                      State / Province
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-[11px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                      placeholder="CA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative border-b border-[#0A0A0A] pb-2">
                    <label className="block text-[8px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/60 mb-2">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-[11px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                      placeholder="90210"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <div className="relative border-b border-[#0A0A0A] pb-2">
                    <label className="block text-[8px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/60 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-[11px] font-sans uppercase tracking-widest text-[#0A0A0A] focus:outline-none placeholder:text-[#0A0A0A]/20"
                      placeholder="UNITED STATES"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-[#0A0A0A] text-[#EAE8E0] text-[9px] tracking-[0.3em] uppercase font-bold hover:bg-[#9C3D2E] hover:text-[#EAE8E0] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed border border-[#0A0A0A]"
                >
                  {submitting ? 'LOGGING COORDINATES...' : 'CONFIRM ADDRESS & DISPATCH'}
                </button>
              </form>

              <div className="flex items-center gap-2 justify-center text-[7px] uppercase tracking-[0.3em] font-bold text-[#0A0A0A]/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2C3625]" />
                ENCRYPTED SSL NODE DIRECTORY ACTIVE
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
