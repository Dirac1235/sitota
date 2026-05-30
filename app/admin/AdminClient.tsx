'use client';

import { useState } from 'react';
import { Package, ShieldCheck, Check, Truck, DollarSign, Users, Award, Tag, Sparkles } from 'lucide-react';

interface Recipient {
  id: string;
  recipientName: string | null;
  email: string | null;
  phone: string | null;
  address: any;
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
}

interface Order {
  id: string;
  createdAt: string;
  giftingMode: string;
  status: string;
  totalAmount: string | number;
  deliverySpeed: string;
  userEmail: string;
  userName: string;
  orgName: string;
  designName: string;
  designPreview: string;
  recipients: Recipient[];
}

interface Organization {
  id: string;
  name: string;
  brandColor: string | null;
  billingPlan: string;
  memberCount: number;
  createdAt: string;
}

export default function AdminClient({ 
  initialOrders, 
  organizations 
}: { 
  initialOrders: Order[]; 
  organizations: Organization[]; 
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable fields for selected recipient
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(null);
  const [recipientStatus, setRecipientStatus] = useState('PROCESSING');
  const [carrier, setCarrier] = useState('DHL');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Promo Code State
  const [promoName, setPromoName] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('20');
  const [promosList, setPromosList] = useState<{ name: string; discount: string }[]>([
    { name: 'SITOTA20', discount: '20' }
  ]);

  const handleCreatePromo = () => {
    if (!promoName) return;
    const newPromo = { name: promoName.toUpperCase().trim(), discount: promoDiscount };
    setPromosList([newPromo, ...promosList]);
    setPromoName('');
    
    // Save to localStorage so Checkout can check it!
    localStorage.setItem('promos', JSON.stringify([newPromo, ...promosList]));
    setSuccessMsg(`Promo Code ${newPromo.name} registered globally.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const startEditRecipient = (r: Recipient) => {
    setEditingRecipientId(r.id);
    setRecipientStatus(r.status);
    setCarrier(r.carrier || 'DHL');
    setTrackingNumber(r.trackingNumber || '');
  };

  const handleUpdateRecipient = async (orderId: string) => {
    if (!editingRecipientId) return;
    setIsUpdating(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: editingRecipientId,
          status: recipientStatus,
          carrier,
          trackingNumber
        })
      });

      const data = await res.json();
      setIsUpdating(false);

      if (res.ok && data.success) {
        setSuccessMsg('Fulfillment coordinates synchronized.');
        
        // Update local state
        const updatedOrders = orders.map(o => {
          if (o.id === orderId) {
            const updatedRecipients = o.recipients.map(r => {
              if (r.id === editingRecipientId) {
                return { ...r, status: recipientStatus, carrier, trackingNumber };
              }
              return r;
            });
            
            // Check if entire order status needs change
            let orderStatus = o.status;
            if (updatedRecipients.every(rec => rec.status === 'DELIVERED')) {
              orderStatus = 'DELIVERED';
            } else if (updatedRecipients.some(rec => rec.status === 'SHIPPED')) {
              orderStatus = 'SHIPPED';
            }

            const updatedOrder = { ...o, recipients: updatedRecipients, status: orderStatus };
            if (selectedOrder?.id === orderId) {
              setSelectedOrder(updatedOrder);
            }
            return updatedOrder;
          }
          return o;
        });

        setOrders(updatedOrders);
        setEditingRecipientId(null);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.error || 'Update failed.');
      }
    } catch (err) {
      setIsUpdating(false);
      setErrorMsg('A connection error occurred.');
    }
  };

  // Stats calculation
  const totalGmv = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);
  const activeDeployments = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'DELIVERED').length;
  const uniqueTenants = organizations.length;
  const slaCompliance = "99.8%";

  return (
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative animate-bloom">
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0"></div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        
        {/* Header */}
        <header className="mb-16 border-b border-[#8F9C86]/15 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full animate-ping"></span>
              STATION 99 // PLATFORM CENTRAL CONSOLE
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Super <span className="italic font-light lowercase text-[#D27D5B]">Admin</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold mt-2">
              Oversee multi-tenant campaigns, allocate secure tracking nodes, and manage platform promotions.
            </p>
          </div>
          <span className="px-6 py-3 bg-[#1F2B1A] text-[#FAF6EE] text-[10px] uppercase tracking-[0.25em] font-bold rounded-full font-mono border border-[#8F9C86]/20">
            PLATFORM STATUS: UNIFIED LOGS ACTIVE
          </span>
        </header>

        {successMsg && (
          <div className="mb-12 border border-[#8F9C86]/30 bg-[#8F9C86]/10 px-8 py-5 text-xs uppercase tracking-widest text-[#1F2B1A] font-bold flex items-center gap-3 rounded-2xl animate-bloom">
            <Check className="w-4 h-4 stroke-[2.5] text-[#D27D5B]" /> {successMsg}
          </div>
        )}

        {/* Global Platform Metrics Bento (Section 4.11.6) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          <div className="bg-[#F5F1E6]/30 p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between hover:bg-[#FAF6EE] transition-all duration-500 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Platform GMV</span>
              <DollarSign className="w-4 h-4 text-[#D27D5B]" />
            </div>
            <div className="mt-8">
              <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">${totalGmv.toFixed(2)}</span>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Gross platform capital flow</p>
            </div>
          </div>

          <div className="bg-[#F5F1E6]/30 p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between hover:bg-[#FAF6EE] transition-all duration-500 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Active Campaigns</span>
              <Package className="w-4 h-4 text-[#D27D5B]" />
            </div>
            <div className="mt-8">
              <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">{activeDeployments}</span>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Active shipment channels</p>
            </div>
          </div>

          <div className="bg-[#F5F1E6]/30 p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between hover:bg-[#FAF6EE] transition-all duration-500 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Corporate Tenants</span>
              <Users className="w-4 h-4 text-[#D27D5B]" />
            </div>
            <div className="mt-8">
              <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">{uniqueTenants}</span>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Organizations registered</p>
            </div>
          </div>

          <div className="bg-[#F5F1E6]/30 p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between hover:bg-[#FAF6EE] transition-all duration-500 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Fulfillment SLA</span>
              <Award className="w-4 h-4 text-[#D27D5B]" />
            </div>
            <div className="mt-8">
              <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">{slaCompliance}</span>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">On-time target score</p>
            </div>
          </div>

        </div>

        {/* Dynamic Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left Column: Platform Order Queue (Section 4.11.3) */}
          <div className="lg:col-span-8 border border-[#8F9C86]/20 bg-[#F5F1E6]/10 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex justify-between items-center bg-[#F5F1E6]/30">
              <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">Global Deployment Queue</h3>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40 font-mono">// QUEUE_LEDGER</span>
            </div>

            <div className="divide-y divide-[#8F9C86]/15">
              {orders.map((o) => (
                <div 
                  key={o.id} 
                  onClick={() => { setSelectedOrder(o); setEditingRecipientId(null); }}
                  className={`p-8 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    selectedOrder?.id === o.id ? 'bg-[#FAF6EE]/90' : 'hover:bg-[#FAF6EE]/45'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#D27D5B]">{o.id}</span>
                      <span className="text-[8px] uppercase tracking-widest font-bold px-2.5 py-1 bg-[#1F2B1A] text-[#FAF6EE] rounded-full">
                        {o.status}
                      </span>
                    </div>
                    <h4 className="font-serif text-xl uppercase tracking-tight text-[#1F2B1A]">{o.designName}</h4>
                    <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/60 font-semibold block">
                      Sender: {o.userName} ({o.orgName})
                    </span>
                  </div>

                  <div className="text-right space-y-1 text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/60">
                    <span className="block text-[10px] text-[#1F2B1A]/40">Deploy Sum</span>
                    <span className="font-serif text-base text-[#1F2B1A] font-bold">${parseFloat(o.totalAmount.toString()).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Detail & Recipient Editor */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28">
            {selectedOrder ? (
              <div className="border border-[#8F9C86]/20 bg-[#FAF6EE] p-8 rounded-[2rem] space-y-8 shadow-md animate-fade-in">
                <div>
                  <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-2">
                    STATION 03 // FULL SPECS DETECTOR
                  </span>
                  <h3 className="font-serif text-2xl uppercase tracking-tight text-[#1F2B1A]">Campaign specs</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-[#F5F1E6] rounded-xl border border-[#8F9C86]/10 overflow-hidden relative">
                      <img src={selectedOrder.designPreview} alt="proof" className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-[#D27D5B] font-bold block mb-1">Branded Concept</span>
                      <h4 className="font-serif text-lg text-[#1F2B1A] uppercase tracking-tight leading-tight">{selectedOrder.designName}</h4>
                      <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold block mt-1">Sum: ${parseFloat(selectedOrder.totalAmount.toString()).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Recipients details list */}
                  <div className="space-y-4 pt-4 border-t border-[#8F9C86]/15">
                    <span className="block text-[8px] uppercase tracking-widest text-[#1F2B1A]/50 font-sans font-bold">Recipient Fulfillment status</span>
                    
                    {errorMsg && (
                      <div className="text-[10px] text-red-600 font-bold block">// Error: {errorMsg}</div>
                    )}

                    <div className="space-y-4 divide-y divide-[#8F9C86]/10 max-h-80 overflow-y-auto pr-1">
                      {selectedOrder.recipients.map((rec) => (
                        <div key={rec.id} className="pt-3 first:pt-0 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs uppercase font-bold text-[#1F2B1A] block">{rec.recipientName || 'Unsubmitted name'}</span>
                              <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 block font-mono mt-0.5">// {rec.email || 'Unsubmitted email'}</span>
                            </div>
                            <span className="px-2.5 py-1 text-[8px] uppercase font-bold tracking-widest rounded-full bg-slate-500/10 text-slate-700">
                              {rec.status}
                            </span>
                          </div>

                          {editingRecipientId === rec.id ? (
                            /* Sub form to edit status & details */
                            <div className="bg-[#F5F1E6]/40 p-4 border border-[#8F9C86]/15 rounded-xl space-y-4 animate-fade-in">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Status</label>
                                  <select 
                                    className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                                    value={recipientStatus}
                                    onChange={(e) => setRecipientStatus(e.target.value)}
                                  >
                                    <option value="AWAITING_ADDRESS">Awaiting Addr</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Carrier</label>
                                  <select 
                                    className="w-full bg-transparent text-[10px] font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                  >
                                    <option value="DHL">DHL Express</option>
                                    <option value="FedEx">FedEx Corp</option>
                                    <option value="UPS">UPS Ground</option>
                                    <option value="USPS">USPS First</option>
                                  </select>
                                </div>
                              </div>

                              <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                                <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Tracking Number</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-transparent text-[10px] font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none"
                                  placeholder="TRK-990-221A"
                                  value={trackingNumber}
                                  onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                              </div>

                              <div className="flex gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setEditingRecipientId(null)}
                                  className="flex-1 py-1.5 border border-[#8F9C86]/30 text-[#1F2B1A] text-[9px] uppercase font-bold rounded-full cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateRecipient(selectedOrder.id)}
                                  className="flex-1 py-1.5 bg-[#D27D5B] text-[#FAF6EE] text-[9px] uppercase font-bold rounded-full cursor-pointer"
                                >
                                  {isUpdating ? 'Saving...' : 'Save Nodes'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center pt-1.5">
                              {rec.trackingNumber ? (
                                <span className="text-[9px] uppercase font-mono font-bold text-[#1F2B1A]/60">
                                  {rec.carrier}: {rec.trackingNumber}
                                </span>
                              ) : (
                                <span className="text-[9px] text-yellow-800 italic uppercase font-bold font-mono">No tracking assigned</span>
                              )}
                              <button 
                                type="button"
                                onClick={() => startEditRecipient(rec)}
                                className="text-xs font-bold text-[#D27D5B] hover:text-[#1F2B1A] transition-colors"
                              >
                                Edit Logistics &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 p-12 rounded-[2rem] text-center space-y-4 shadow-sm">
                <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40 block">// SYSTEM_RECORDS</span>
                <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/50 font-bold italic">
                  Select a campaign row from ledger to inspect and edit fulfillment parameters.
                </p>
              </div>
            )}

            {/* In-Memory Promo Code Creator Node (Section 4.11.5) */}
            <div className="border border-[#8F9C86]/20 bg-[#FAF9F5] p-6 lg:p-8 rounded-[2rem] space-y-6 shadow-sm">
              <div>
                <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-2">
                  STATION 04 // PLATFORM PROMO GENERATOR
                </span>
                <h3 className="font-serif text-xl uppercase tracking-tight text-[#1F2B1A]">Promo codes</h3>
              </div>

              <div className="space-y-4">
                <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                  <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1 group-focus-within:text-[#D27D5B]">Voucher Code Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none"
                    placeholder="E.G., DECEASED40"
                    value={promoName}
                    onChange={(e) => setPromoName(e.target.value)}
                  />
                </div>

                <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                  <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1 group-focus-within:text-[#D27D5B]">Discount Value (%)</label>
                  <input 
                    type="number" 
                    className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none"
                    placeholder="e.g. 40"
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(e.target.value)}
                  />
                </div>

                <button 
                  type="button"
                  onClick={handleCreatePromo}
                  className="w-full py-3.5 bg-[#1F2B1A] text-[#FAF6EE] text-[9px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-[#D27D5B] transition-colors cursor-pointer"
                >
                  Create Promo Code
                </button>
              </div>

              <div className="pt-4 border-t border-[#8F9C86]/10 space-y-2">
                <span className="block text-[8px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono font-bold">Active Platform Promos:</span>
                <div className="flex flex-wrap gap-2 text-[9px] uppercase tracking-wider font-bold">
                  {promosList.map((pr, idx) => (
                    <span key={idx} className="px-3 py-1.5 border border-[#D27D5B]/30 bg-[#D27D5B]/5 text-[#D27D5B] rounded-full">
                      {pr.name} ({pr.discount}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Corporate Organizations ledger list */}
        <div className="border border-[#8F9C86]/20 bg-[#F5F1E6]/10 rounded-[2.5rem] shadow-sm overflow-hidden mb-16">
          <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex justify-between items-center bg-[#F5F1E6]/30">
            <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">Registered Workspace Tenants</h3>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40 font-mono">// TENANT_LEDGER</span>
          </div>

          <div className="divide-y divide-[#8F9C86]/15">
            {organizations.map((org) => (
              <div key={org.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAF6EE]/35 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: org.brandColor || '#9C3D2E' }}></div>
                    <span className="text-xs md:text-sm uppercase font-bold text-[#1F2B1A]">{org.name}</span>
                    <span className="px-2.5 py-1 text-[8px] uppercase tracking-widest font-bold bg-[#1F2B1A] text-[#FAF6EE] rounded-full border border-transparent">
                      {org.billingPlan}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold block">
                    ID: {org.id} &bull; Members: {org.memberCount} &bull; Scribed on {new Date(org.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-right flex items-center gap-4">
                  <span className="px-4 py-2 border border-[#8F9C86]/20 bg-[#FAF9F5] rounded-full text-[9px] uppercase tracking-widest font-bold text-[#1F2B1A]/60">
                    SLA Checked
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
