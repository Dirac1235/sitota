'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Truck, Check, HelpCircle, ArrowRight, Clipboard, Plus, Trash } from 'lucide-react';

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

  useEffect(() => {
    if (!designId) {
      router.push('/catalog');
      return;
    }

    // Fetch design details using standard browser fetch
    fetch(`/api/orders?id=${designId}`)
      .then((res) => res.json())
      .then((data) => {
        setDesign({
          id: designId,
          imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600&blend=000000&blend-alpha=30&blend-mode=overlay',
          productName: 'Premium Ceramic Mug',
          basePrice: 15.00
        });
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
          recipients: finalRecipients
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
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1c1c1c]/50 animate-pulse">Loading Studio Parameters...</span>
      </div>
    );
  }

  const activeRecipientsCount = giftingMode === 'SINGLE' ? 1 : bulkRecipients.length;
  const unitPrice = design?.basePrice || 15.00;
  const subtotal = unitPrice * activeRecipientsCount;
  const shippingCost = deliverySpeed === 'STANDARD' ? 5.00 * activeRecipientsCount : 15.00 * activeRecipientsCount;
  const total = subtotal + shippingCost;

  return (
    <div className="bg-[#FDFBF7] min-h-screen pb-24 relative">
      {/* Dynamic Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-[#1c1c1c]/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white border border-[#1c1c1c]/10 p-10 max-w-md w-full text-center space-y-6 animate-fade-in shadow-xl">
            <div className="w-16 h-16 bg-[#8B7355]/10 text-[#8B7355] rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-[#1c1c1c]">Order Successfully Secured</h3>
            <p className="text-xs text-[#1c1c1c]/60 font-light leading-relaxed">
              Your customized gifting campaign has been registered. Recipients will receive automated notifications, and production will begin shortly.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-[#1c1c1c] text-[#FDFBF7] text-xs tracking-wider uppercase font-semibold hover:bg-[#333] transition-colors"
            >
              Enter Client Portal
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        <header className="mb-12 border-b border-[#1c1c1c]/10 pb-8 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-4xl text-[#1c1c1c]">Gifting Checkout</h1>
            <p className="text-xs uppercase tracking-widest text-[#1c1c1c]/50 font-bold mt-1">Configure your corporate campaign</p>
          </div>
          <Link href="/catalog" className="text-xs uppercase tracking-wider font-semibold text-[#1c1c1c]/50 hover:text-[#1c1c1c]">
            Cancel
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Columns - Form Details */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Campaign Gifting Mode */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#8B7355]">01. Choose Gifting Mode</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => setGiftingMode('SINGLE')}
                  className={`border p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between h-40 ${giftingMode === 'SINGLE' ? 'border-[#1c1c1c] bg-white' : 'border-[#1c1c1c]/10 bg-[#FAF8F5]/50 hover:border-[#1c1c1c]/40'}`}
                >
                  <span className="text-xs uppercase tracking-widest font-bold text-[#1c1c1c]">Individual Gesture</span>
                  <p className="text-xs font-light text-[#1c1c1c]/60 leading-relaxed mt-2">
                    Send a highly personalized gift directly to one recipient. Address specified during checkout.
                  </p>
                </div>
                <div 
                  onClick={() => setGiftingMode('BULK')}
                  className={`border p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between h-40 ${giftingMode === 'BULK' ? 'border-[#1c1c1c] bg-white' : 'border-[#1c1c1c]/10 bg-[#FAF8F5]/50 hover:border-[#1c1c1c]/40'}`}
                >
                  <span className="text-xs uppercase tracking-widest font-bold text-[#1c1c1c]">Corporate Campaign</span>
                  <p className="text-xs font-light text-[#1c1c1c]/60 leading-relaxed mt-2">
                    Send to multiple recipients. Upload lists or enable seamless address collection via our secure link system.
                  </p>
                </div>
              </div>
            </div>

            {/* Recipients Section */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#8B7355]">02. Recipient Information</h3>
              
              {giftingMode === 'SINGLE' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 border border-[#1c1c1c]/10 shadow-sm">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1c1c1c]/60 mb-2">Recipient Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 border border-[#1c1c1c]/10 text-sm focus:outline-none focus:border-[#1c1c1c] bg-gray-50/30"
                      placeholder="Alex Morgan"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1c1c1c]/60 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full px-4 py-3 border border-[#1c1c1c]/10 text-sm focus:outline-none focus:border-[#1c1c1c] bg-gray-50/30"
                      placeholder="alex@company.com"
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 border-t border-[#1c1c1c]/5 pt-6 mt-2">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1c1c1c]/60 mb-2">Street Address</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 border border-[#1c1c1c]/10 text-sm focus:outline-none focus:border-[#1c1c1c] bg-gray-50/30 mb-4"
                      placeholder="123 Luxury Way, Suite 400"
                      value={singleStreet}
                      onChange={(e) => setSingleStreet(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1c1c1c]/60 mb-2">City</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 border border-[#1c1c1c]/10 text-sm focus:outline-none focus:border-[#1c1c1c] bg-gray-50/30"
                      placeholder="Beverly Hills"
                      value={singleCity}
                      onChange={(e) => setSingleCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1c1c1c]/60 mb-2">State</label>
                        <input 
                          type="text" 
                          required 
                          className="w-full px-4 py-3 border border-[#1c1c1c]/10 text-sm focus:outline-none focus:border-[#1c1c1c] bg-gray-50/30"
                          placeholder="CA"
                          value={singleState}
                          onChange={(e) => setSingleState(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1c1c1c]/60 mb-2">ZIP</label>
                        <input 
                          type="text" 
                          required 
                          className="w-full px-4 py-3 border border-[#1c1c1c]/10 text-sm focus:outline-none focus:border-[#1c1c1c] bg-gray-50/30"
                          placeholder="90210"
                          value={singleZip}
                          onChange={(e) => setSingleZip(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 border border-[#1c1c1c]/10 shadow-sm space-y-6">
                  {/* Address Collection Checkbox */}
                  <div className="flex items-center gap-3 bg-[#FAF8F5] p-4 border border-[#1c1c1c]/5">
                    <input 
                      type="checkbox" 
                      id="collect-link"
                      className="w-4 h-4 text-[#1c1c1c] border-[#1c1c1c]/10"
                      checked={collectAddressesViaLink}
                      onChange={(e) => setCollectAddressesViaLink(e.target.checked)}
                    />
                    <label htmlFor="collect-link" className="text-xs text-[#1c1c1c]/70 font-semibold select-none cursor-pointer">
                      Secure Address Collection (Let recipients fill in their own address via customized email link)
                    </label>
                  </div>

                  {/* Add Bulk User Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b border-[#1c1c1c]/5 pb-6">
                    <div className="md:col-span-5">
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1c1c1c]/60 mb-2">Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-[#1c1c1c]/10 text-sm focus:outline-none bg-gray-50/30"
                        placeholder="Alex Morgan"
                        value={bulkName}
                        onChange={(e) => setBulkName(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#1c1c1c]/60 mb-2">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 border border-[#1c1c1c]/10 text-sm focus:outline-none bg-gray-50/30"
                        placeholder="alex@company.com"
                        value={bulkEmail}
                        onChange={(e) => setBulkEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button 
                        type="button"
                        onClick={addBulkRecipient}
                        className="w-full py-3.5 bg-[#1c1c1c] text-white flex items-center justify-center hover:bg-[#333] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Render Added Users */}
                  {bulkRecipients.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#1c1c1c]/40 font-light italic">
                      Add recipients to populate the custom gifting list.
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#1c1c1c]/5">
                      {bulkRecipients.map((rec, index) => (
                        <li key={index} className="py-4 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-semibold text-[#1c1c1c]">{rec.name}</span>
                            <span className="text-xs text-[#1c1c1c]/50 block mt-0.5">{rec.email}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeBulkRecipient(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Logistics */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#8B7355]">03. Delivery Preference</h3>
              <div className="space-y-4">
                <label className={`border p-6 flex justify-between items-center cursor-pointer bg-white transition-all ${deliverySpeed === 'STANDARD' ? 'border-[#1c1c1c]' : 'border-[#1c1c1c]/10'}`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="delivery" 
                      className="text-[#1c1c1c]" 
                      checked={deliverySpeed === 'STANDARD'}
                      onChange={() => setDeliverySpeed('STANDARD')}
                    />
                    <div>
                      <span className="text-xs uppercase tracking-widest font-bold block">Standard Delivery</span>
                      <span className="text-[10px] text-[#1c1c1c]/50 font-semibold block mt-1">Delivery in 5-7 business days</span>
                    </div>
                  </div>
                  <span className="font-serif text-sm font-medium">$5.00 / recipient</span>
                </label>
                
                <label className={`border p-6 flex justify-between items-center cursor-pointer bg-white transition-all ${deliverySpeed === 'EXPRESS' ? 'border-[#1c1c1c]' : 'border-[#1c1c1c]/10'}`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="delivery" 
                      className="text-[#1c1c1c]" 
                      checked={deliverySpeed === 'EXPRESS'}
                      onChange={() => setDeliverySpeed('EXPRESS')}
                    />
                    <div>
                      <span className="text-xs uppercase tracking-widest font-bold block">Express Shipping</span>
                      <span className="text-[10px] text-[#1c1c1c]/50 font-semibold block mt-1">Delivery in 2-3 business days</span>
                    </div>
                  </div>
                  <span className="font-serif text-sm font-medium">$15.00 / recipient</span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Columns - Cart Summary Preview */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
            <div className="border border-[#1c1c1c]/10 bg-white p-8 space-y-8">
              <h3 className="font-serif text-xl border-b border-[#1c1c1c]/10 pb-4">Campaign Summary</h3>
              
              {/* Product Design Mini Card */}
              <div className="flex gap-4">
                <div className="w-20 h-24 bg-[#FAF8F5] border border-[#1c1c1c]/5 overflow-hidden flex-shrink-0">
                  <img src={design?.imageUrl} alt="mini proof" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#8B7355] font-bold block mb-1">Approved Proof</span>
                  <h4 className="font-serif text-base text-[#1c1c1c]">{design?.productName}</h4>
                  <p className="text-xs font-light text-[#1c1c1c]/50 mt-1">Unit Value: ${unitPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 border-t border-b border-[#1c1c1c]/10 py-6 text-sm">
                <div className="flex justify-between font-light">
                  <span className="text-[#1c1c1c]/60">Items Subtotal ({activeRecipientsCount} units)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-light">
                  <span className="text-[#1c1c1c]/60">Luxury Courier Logistics</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#1c1c1c] text-base pt-2">
                  <span className="font-serif">Campaign Total</span>
                  <span className="font-serif">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || (giftingMode === 'BULK' && bulkRecipients.length === 0)}
                className="w-full py-4 bg-[#1c1c1c] text-white text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#333] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Securing Campaign Assets...' : 'Place Order'}
              </button>
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
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1c1c1c]/50 animate-pulse">Initializing Checkout Studio...</span>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
