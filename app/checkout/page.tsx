'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Truck, Check, HelpCircle, ArrowRight, Clipboard, Plus, Trash, ShieldCheck, CreditCard, Receipt, PiggyBank, Sparkles } from 'lucide-react';

interface Recipient {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
}

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get('designId');

  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [giftingMode, setGiftingMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [deliverySpeed, setDeliverySpeed] = useState('STANDARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  // Payments & Billing State (Section 4.9)
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'NET30' | 'BALANCE'>('CARD');
  
  // Card Input details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Net 30 details
  const [poNumber, setPoNumber] = useState('');
  
  // Promo code engine
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Gifting Budget states (Section 4.9.3)
  const [budgetLimit] = useState(3000); // Mock Workspace Gifting Budget Limit
  const [budgetSpent] = useState(1250); // Mock Already Spent
  const budgetRemaining = budgetLimit - budgetSpent;

  // Single Recipient Fields
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [singleStreet, setSingleStreet] = useState('');
  const [singleCity, setSingleCity] = useState('');
  const [singleState, setSingleState] = useState('');
  const [singleZip, setSingleZip] = useState('');
  const [singleCountry, setSingleCountry] = useState('United States');

  // Bulk Recipients Array
  const [bulkRecipients, setBulkRecipients] = useState<Recipient[]>([]);
  const [bulkName, setBulkName] = useState('');
  const [bulkEmail, setBulkEmail] = useState('');
  const [collectAddressesViaLink, setCollectAddressesViaLink] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.groups) {
          setGroups(data.groups);
        }
      })
      .catch((err) => console.error('Error fetching campaign groups:', err));
  }, []);

  useEffect(() => {
    if (!designId) {
      router.push('/catalog');
      return;
    }

    // Fetch design details dynamically
    fetch(`/api/orders?designId=${designId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.success && data.design) {
          const d = data.design;
          const name = d.bundle ? d.bundle.name : (d.product ? d.product.name : 'Custom Concept');
          const price = d.bundle ? d.bundle.price : (d.product ? d.product.basePrice : 15.00);
          const img = d.previewImageUrl || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

          setDesign({
            id: d.id,
            imageUrl: img,
            productName: name,
            basePrice: price,
            isBundle: !!d.bundleId
          });
        } else {
          router.push('/catalog');
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/catalog');
        setLoading(false);
      });
  }, [designId]);

  const addBulkRecipient = () => {
    if (!bulkName || !bulkEmail) return;
    setBulkRecipients([
      ...bulkRecipients,
      {
        name: bulkName,
        email: bulkEmail,
        address: collectAddressesViaLink ? null : {
          street: '123 Luxury Way',
          city: 'Beverly Hills',
          state: 'CA',
          postalCode: '90210',
          country: 'United States'
        }
      }
    ]);
    setBulkName('');
    setBulkEmail('');
  };

  const removeBulkRecipient = (index: number) => {
    setBulkRecipients(bulkRecipients.filter((_, i) => i !== index));
  };

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCodeInput.trim().toUpperCase() === 'SITOTA20') {
      setAppliedPromo('SITOTA20');
      setDiscountPercent(20);
    } else {
      setPromoError('Promo code not valid or expired');
    }
  };

  // Pricing calculations
  const activeRecipientsCount = giftingMode === 'SINGLE' ? 1 : bulkRecipients.length;
  const unitPrice = design?.basePrice || 15.00;
  const rawSubtotal = unitPrice * activeRecipientsCount;
  
  // Apply Promo discount
  const discountAmount = rawSubtotal * (discountPercent / 100);
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  
  const shippingCost = deliverySpeed === 'STANDARD' ? 5.00 * activeRecipientsCount : 15.00 * activeRecipientsCount;
  const total = subtotal + shippingCost;

  // Check if exceeds budget
  const exceedsBudget = total > budgetRemaining;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    const finalRecipients: Recipient[] = giftingMode === 'SINGLE' 
      ? [
          {
            name: singleName,
            email: singleEmail,
            address: {
              street: singleStreet,
              city: singleCity,
              state: singleState,
              postalCode: singleZip,
              country: singleCountry
            }
          }
        ]
      : bulkRecipients;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designId,
          giftingMode,
          deliverySpeed,
          recipients: finalRecipients,
          paymentMethod,
          poNumber: paymentMethod === 'NET30' ? poNumber : null,
          totalAmount: total,
          discountPercent
        }),
      });

      if (res.ok) {
        setSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE]">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A] animate-pulse">Initializing Checkout Studio...</span>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen pb-24 relative">
      
      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-[#1F2B1A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#FAF6EE] border border-[#8F9C86]/20 p-8 lg:p-12 max-w-lg w-full relative shadow-2xl rounded-[2.5rem] space-y-8 animate-fade-in text-center">
            <div className="w-16 h-16 bg-[#8F9C86]/10 text-[#8F9C86] rounded-full flex items-center justify-center mx-auto border border-[#8F9C86]/20 shadow-inner">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-3">
              <span className="inline-block text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B] bg-[#D27D5B]/10 px-3 py-1.5 rounded-full">
                TRANSACTION SECURED
              </span>
              <h3 className="font-serif text-3xl text-[#1F2B1A] uppercase tracking-tight leading-none">Campaign Registered</h3>
              <p className="text-xs md:text-sm font-sans text-[#1F2B1A]/70 uppercase tracking-widest leading-[2.2] mt-4 max-w-sm mx-auto font-medium">
                Your custom suite and branding directives have been processed. Transaction records and email notifications have been triggered successfully.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4.5 bg-[#1F2B1A] text-[#FAF6EE] text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-[#D27D5B] transition-colors duration-500 shadow-md"
            >
              Enter Client Portal
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-12 reveal-text">
        <header className="mb-16 border-b border-[#8F9C86]/15 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full"></span>
              CHECKOUT CHECKPOINT
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Gifting <span className="italic font-light lowercase text-[#D27D5B]">checkout</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold mt-2">Log campaign parameters & verify shipping routing</p>
          </div>
          <Link href="/catalog" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors pb-1 border-b border-transparent hover:border-[#D27D5B]">
            &larr; Cancel Customization
          </Link>
        </header>

        {/* Workspace Budget Progress Bar (Section 4.9.3) */}
        <div className="mb-12 border border-[#8F9C86]/20 bg-[#FAF9F5] rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-[#D27D5B] font-bold block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Budget Utilization
            </span>
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Monthly Team Spending Limits</h4>
          </div>
          
          <div className="flex-grow max-w-xl w-full space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#1F2B1A]/60">
              <span>Spent: ${budgetSpent.toFixed(2)}</span>
              <span>Available: ${budgetRemaining.toFixed(2)} / ${budgetLimit.toFixed(2)} limit</span>
            </div>
            <div className="w-full bg-[#1F2B1A]/10 h-3 rounded-full overflow-hidden border border-[#8F9C86]/10">
              <div 
                className="bg-[#D27D5B] h-full rounded-full transition-all duration-500"
                style={{ width: `${(budgetSpent / budgetLimit) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {exceedsBudget && (
          <div className="mb-12 border border-yellow-600/30 bg-yellow-600/5 px-8 py-5 text-xs uppercase tracking-widest text-yellow-800 font-bold rounded-2xl animate-bloom flex items-center gap-2">
            🌿 Warning: This order exceeds your team budget by ${(total - budgetRemaining).toFixed(2)}. Proceeding will route this order to your Organization Admin for manual approval before entering production.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Form Panel */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* 1. Gifting Mode */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">01 /</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Gifting Destination Mode</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => setGiftingMode('SINGLE')}
                  className={`border p-8 cursor-pointer rounded-[2rem] transition-all duration-500 flex flex-col justify-between min-h-[170px] ${
                    giftingMode === 'SINGLE' 
                      ? 'border-[#D27D5B] bg-[#F5F1E6]/50 shadow-sm' 
                      : 'border-[#8F9C86]/15 bg-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">Individual Gesture</span>
                  <p className="text-xs font-sans font-medium text-[#1F2B1A]/70 uppercase tracking-widest leading-[1.9] mt-3">
                    Dispatch a highly customized gift directly to a single destination. Secure coordinate entry below.
                  </p>
                </div>
                
                <div 
                  onClick={() => setGiftingMode('BULK')}
                  className={`border p-8 cursor-pointer rounded-[2rem] transition-all duration-500 flex flex-col justify-between min-h-[170px] ${
                    giftingMode === 'BULK' 
                      ? 'border-[#D27D5B] bg-[#F5F1E6]/50 shadow-sm' 
                      : 'border-[#8F9C86]/15 bg-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">Corporate Campaign</span>
                  <p className="text-xs font-sans font-medium text-[#1F2B1A]/70 uppercase tracking-widest leading-[1.9] mt-3">
                    Deploy gifts to multiple recipients. Upload directory databases or enable secure recipient address collectors.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Recipient Specifications */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">02 /</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Recipient Destination Details</h3>
              </div>
              
              {giftingMode === 'SINGLE' ? (
                <div className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 lg:p-12 rounded-[2rem] space-y-8">
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Recipient Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="ALEX MORGAN"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="ALEX@COMPANY.COM"
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group pt-4 focus-within:border-[#D27D5B]">
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Street Address</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="123 SEEDLING BLVD, ROAD 4"
                      value={singleStreet}
                      onChange={(e) => setSingleStreet(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                      <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">City</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="BEVERLY HILLS"
                        value={singleCity}
                        onChange={(e) => setSingleCity(e.target.value)}
                      />
                    </div>
                    <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                      <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">State</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="CA"
                        value={singleState}
                        onChange={(e) => setSingleState(e.target.value)}
                      />
                    </div>
                    <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                      <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">ZIP</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="90210"
                        value={singleZip}
                        onChange={(e) => setSingleZip(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 lg:p-12 rounded-[2rem] space-y-8">
                  {/* Load Saved Campaign Group */}
                  {groups.length > 0 && (
                    <div className="border border-[#8F9C86]/20 p-5 rounded-2xl bg-[#FAF6EE]/50 space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-[#1F2B1A] font-bold select-none cursor-pointer leading-normal">
                        🌿 Load Saved Campaign Group (Auto-fill members from Address Book)
                      </label>
                      <select
                        onChange={(e) => {
                          const groupId = e.target.value;
                          if (!groupId) return;
                          const selectedGroup = groups.find(g => g.id === groupId);
                          if (selectedGroup && selectedGroup.members) {
                            const mappedMembers = selectedGroup.members.map((member: any) => ({
                              name: member.name,
                              email: member.email || '',
                              address: member.address ? {
                                street: member.address.street || '',
                                city: member.address.city || '',
                                state: member.address.state || '',
                                postalCode: member.address.postalCode || member.address.zip || '',
                                country: member.address.country || 'United States'
                              } : null
                            }));
                            setBulkRecipients(prev => [
                              ...prev,
                              ...mappedMembers.filter((m: any) => !prev.some((p: any) => p.email === m.email))
                            ]);
                          }
                          // Reset selection back to empty
                          e.target.value = '';
                        }}
                        className="w-full bg-transparent border-b border-[#8F9C86]/30 text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer pb-2"
                      >
                        <option value="">-- Choose Campaign Group --</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id} className="bg-[#FAF6EE] text-[#1F2B1A]">
                            {g.name.toUpperCase()} ({g.members.length} members)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Address Collection Checkbox */}
                  <div className="flex items-center gap-4 border border-[#8F9C86]/20 p-5 rounded-2xl bg-[#FAF6EE]/50">
                    <input 
                      type="checkbox" 
                      id="collect-link"
                      className="w-4 h-4 accent-[#D27D5B] border-[#8F9C86]/40"
                      checked={collectAddressesViaLink}
                      onChange={(e) => setCollectAddressesViaLink(e.target.checked)}
                    />
                    <label htmlFor="collect-link" className="text-xs uppercase tracking-widest text-[#1F2B1A] font-bold select-none cursor-pointer leading-normal">
                      Secure Address Collection Port (Recipients supply addresses via secure botanical links)
                    </label>
                  </div>

                  {/* Add Bulk User Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end border-b border-[#8F9C86]/15 pb-8">
                    <div className="md:col-span-5 relative border-b border-[#8F9C86]/30 pb-1">
                      <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="ALEX MORGAN"
                        value={bulkName}
                        onChange={(e) => setBulkName(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-5 relative border-b border-[#8F9C86]/30 pb-1">
                      <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="ALEX@COMPANY.COM"
                        value={bulkEmail}
                        onChange={(e) => setBulkEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button 
                        type="button"
                        onClick={addBulkRecipient}
                        className="w-full py-3.5 bg-[#1F2B1A] text-[#FAF6EE] flex items-center justify-center hover:bg-[#D27D5B] transition-colors rounded-xl shadow-sm border border-[#8F9C86]/10"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Render Added Users */}
                  {bulkRecipients.length === 0 ? (
                    <div className="py-10 text-center text-xs uppercase tracking-[0.2em] text-[#1F2B1A]/40 font-bold italic">
                      No coordinates log active. Populate variables above.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto divide-y divide-[#8F9C86]/10 pr-2">
                      {bulkRecipients.map((rec, index) => (
                        <div key={index} className="py-4 flex justify-between items-center">
                          <div>
                            <span className="text-xs uppercase tracking-wider font-bold text-[#1F2B1A]">{rec.name}</span>
                            <span className="text-xs uppercase tracking-widest text-[#1F2B1A]/50 block mt-1 font-sans font-light">// {rec.email}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeBulkRecipient(index)}
                            className="text-[#D27D5B] hover:text-[#1F2B1A] p-2 transition-colors"
                          >
                            <Trash className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Courier Logistics */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">03 /</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Courier Speed Allocation</h3>
              </div>
              
              <div className="space-y-4">
                <label className={`border p-6 flex justify-between items-center cursor-pointer rounded-2xl transition-all duration-500 ${
                  deliverySpeed === 'STANDARD' 
                    ? 'border-[#D27D5B] bg-[#F5F1E6]/50 shadow-sm' 
                    : 'border-[#8F9C86]/15 bg-transparent opacity-60'
                }`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="delivery" 
                      className="accent-[#D27D5B] w-4 h-4" 
                      checked={deliverySpeed === 'STANDARD'}
                      onChange={() => setDeliverySpeed('STANDARD')}
                    />
                    <div>
                      <span className="text-xs uppercase tracking-[0.2em] font-bold block">Standard Ground Courier</span>
                      <span className="text-xs uppercase tracking-widest text-[#1F2B1A]/50 font-semibold block mt-1">Delivery target in 5-7 business days</span>
                    </div>
                  </div>
                  <span className="font-serif text-lg font-bold text-[#1F2B1A]">${(5.00).toFixed(2)}</span>
                </label>
                
                <label className={`border p-6 flex justify-between items-center cursor-pointer rounded-2xl transition-all duration-500 ${
                  deliverySpeed === 'EXPRESS' 
                    ? 'border-[#D27D5B] bg-[#F5F1E6]/50 shadow-sm' 
                    : 'border-[#8F9C86]/15 bg-transparent opacity-60'
                }`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="delivery" 
                      className="accent-[#D27D5B] w-4 h-4" 
                      checked={deliverySpeed === 'EXPRESS'}
                      onChange={() => setDeliverySpeed('EXPRESS')}
                    />
                    <div>
                      <span className="text-xs uppercase tracking-[0.2em] font-bold block">Priority Express Courier</span>
                      <span className="text-xs uppercase tracking-widest text-[#1F2B1A]/50 font-semibold block mt-1">Delivery target in 2-3 business days</span>
                    </div>
                  </div>
                  <span className="font-serif text-lg font-bold text-[#1F2B1A]">${(15.00).toFixed(2)}</span>
                </label>
              </div>
            </div>

            {/* 4. Automated Billing & Stripe Gateway Section (Section 4.9) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">04 /</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Payment & Corporate Billing</h3>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-4 border border-[#8F9C86]/20 p-2 rounded-2xl bg-[#FAF9F5]">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`py-3 rounded-xl text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'CARD' ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow-sm' : 'text-[#1F2B1A]/60'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Card Node
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('NET30')}
                  className={`py-3 rounded-xl text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'NET30' ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow-sm' : 'text-[#1F2B1A]/60'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" /> Net 30 Invoicing
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('BALANCE')}
                  className={`py-3 rounded-xl text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'BALANCE' ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow-sm' : 'text-[#1F2B1A]/60'
                  }`}
                >
                  <PiggyBank className="w-3.5 h-3.5" /> Org Balance
                </button>
              </div>

              {/* Sub Forms */}
              {paymentMethod === 'CARD' && (
                <div className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 p-8 rounded-[2rem] space-y-6 animate-fade-in">
                  <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block">
                    STRIPE TRANSACTION SECURITY SHIELD ACTIVE
                  </span>

                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Card Number</label>
                    <input 
                      type="text" 
                      maxLength={19}
                      className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                      <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        maxLength={5}
                        className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                      <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">CVV</label>
                      <input 
                        type="password" 
                        maxLength={4}
                        className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NET30' && (
                <div className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 p-8 rounded-[2rem] space-y-6 animate-fade-in">
                  <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block">
                    NET 30 CORPORATE PROCUREMENT TERM ACTIVE
                  </span>
                  
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Purchase Order (PO) Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="PO-2026-8890"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold leading-normal">
                    PO invoice document consolidated and sent within 24 hours. Net 30 payment timeline enforced.
                  </p>
                </div>
              )}

              {paymentMethod === 'BALANCE' && (
                <div className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 p-8 rounded-[2rem] space-y-4 animate-fade-in text-center">
                  <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#8F9C86] block">
                    PREPAID COMPANY CREDIT TERM
                  </span>
                  <div className="py-6">
                    <span className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/60 block mb-1">Available Prepaid Credits</span>
                    <span className="font-serif text-3xl font-bold text-[#1F2B1A]">$2,500.00</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold max-w-sm mx-auto leading-normal">
                    This order of ${total.toFixed(2)} will be debited directly from your centralized workspace budget account.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Campaign Summary Pane */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
            <div className="border border-[#8F9C86]/20 bg-[#FAF6EE] p-8 rounded-[2rem] space-y-8 relative shadow-sm">
              
              <div className="absolute top-0 right-8 border-x border-b border-[#8F9C86]/20 px-3.5 py-1.5 rounded-b-xl text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 bg-[#FAF6EE]">
                SECURE HARMONY
              </div>

              <h3 className="font-serif text-2xl border-b border-[#8F9C86]/15 pb-4 uppercase tracking-tight text-[#1F2B1A]">Campaign Summary</h3>
              
              {/* Product Card */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-24 bg-[#F5F1E6] border border-[#8F9C86]/10 overflow-hidden flex-shrink-0 relative rounded-xl">
                  <img src={design?.imageUrl} alt="proof render" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[9px] uppercase tracking-widest text-[#D27D5B] font-bold block">Approved Custom Concept</span>
                  <h4 className="font-serif text-xl text-[#1F2B1A] uppercase tracking-tight leading-none truncate max-w-[200px]">{design?.productName}</h4>
                  <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/50 font-bold mt-1">Unit value: ${unitPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Promo Code input (Section 4.11.5) */}
              <div className="space-y-3 pt-4 border-t border-[#8F9C86]/10">
                <span className="block text-[8px] uppercase tracking-widest text-[#1F2B1A]/40 font-sans font-bold">Have a Promo Voucher?</span>
                <div className="flex gap-3">
                  <div className="relative border-b border-[#8F9C86]/30 pb-1 flex-grow">
                    <input 
                      type="text" 
                      className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="ENTER CODE (e.g. SITOTA20)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-5 py-2.5 bg-[#1F2B1A] hover:bg-[#D27D5B] text-[#FAF6EE] text-[9px] uppercase tracking-widest font-bold rounded-full transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <span className="text-[10px] text-[#8F9C86] font-bold block">// Code applied! 20% discount activated</span>
                )}
                {promoError && (
                  <span className="text-[10px] text-red-600 font-bold block">// {promoError}</span>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-4 border-t border-b border-[#8F9C86]/15 py-6 text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/70">
                <div className="flex justify-between font-medium">
                  <span>Custom Items ({activeRecipientsCount} units)</span>
                  <span className="text-[#1F2B1A]">${rawSubtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between font-medium text-[#D27D5B]">
                    <span>Promo Coupon ({discountPercent}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Courier Logistics Allocation</span>
                  <span className="text-[#1F2B1A]">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base pt-4 border-t border-[#8F9C86]/10 text-[#1F2B1A]">
                  <span className="font-serif text-[#1F2B1A]">Campaign Sum</span>
                  <span className="font-serif text-lg font-bold text-[#1F2B1A]">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || (giftingMode === 'BULK' && bulkRecipients.length === 0)}
                className="w-full py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isSubmitting ? 'Verifying Campaign Parameters...' : 'Authorize Campaign'}
              </button>

              <div className="flex items-center gap-2.5 justify-center text-[9px] uppercase tracking-[0.3em] font-bold text-[#1F2B1A]/40 mt-4">
                <ShieldCheck className="w-4 h-4 text-[#8F9C86]" />
                AES-256 SSL Encryption active
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE]">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A] animate-pulse">Initializing Checkout Studio...</span>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
