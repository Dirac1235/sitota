'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, Minus, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  description: string | null;
  images: any;
}

interface BundleItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  basePrice: number;
}

interface PresetBundle {
  id: string;
  name: string;
  price: number;
  items: BundleItem[];
}

export default function BundlesClient({ 
  products, 
  presetBundles 
}: { 
  products: Product[]; 
  presetBundles: PresetBundle[]; 
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'PRESET' | 'CUSTOM'>('PRESET');

  // Custom Bundle Builder States
  const [customName, setCustomName] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [productId: string]: number }>({});
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Custom Builder Actions
  const handleAddProduct = (productId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const handleModifyPreset = (bundle: PresetBundle) => {
    setCustomName(`MODIFIED ${bundle.name.toUpperCase()}`);
    const itemsMap: { [productId: string]: number } = {};
    bundle.items.forEach(item => {
      itemsMap[item.productId] = item.quantity;
    });
    setSelectedItems(itemsMap);
    setActiveTab('CUSTOM');
  };

  const customItemCount = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
  
  // Calculate pricing math + 10% Workstation Discount
  const rawTotal = Object.entries(selectedItems).reduce((sum, [pId, qty]) => {
    const prod = products.find(p => p.id === pId);
    return sum + (prod ? prod.basePrice * qty : 0);
  }, 0);
  const discountAmount = rawTotal * 0.10;
  const customBundlePrice = Math.max(0, rawTotal - discountAmount);

  const handleLaunchCustomBundle = async () => {
    if (!customName) {
      setErrorMsg('A unique bundle signature name is required.');
      return;
    }
    if (customItemCount < 2) {
      setErrorMsg('Choose at least 2 products to compose your custom pack.');
      return;
    }

    setIsCreatingCustom(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName,
          price: customBundlePrice,
          items: Object.entries(selectedItems).map(([productId, quantity]) => ({
            productId,
            quantity
          }))
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/catalog/bundle/${data.bundleId}`);
      } else {
        setErrorMsg(data.error || 'Composition failed. Please retry.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('A connection error occurred.');
    } finally {
      setIsCreatingCustom(false);
    }
  };

  return (
    <div className="w-full relative min-h-screen px-6 lg:px-12 py-8 space-y-12 animate-bloom bg-transparent">
      
      {/* Warm Premium Header */}
      <header className="p-8 lg:p-14 bg-[#F5F1E6]/40 backdrop-blur-[2px] rounded-[2.5rem] border border-[#8F9C86]/15 flex flex-col lg:flex-row lg:items-end justify-between shadow-sm gap-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full"></span>
            Bundle workstation
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-[#1F2B1A] leading-none uppercase tracking-tighter mb-6">
            Curated <span className="italic font-light lowercase text-[#D27D5B]">Packs</span>.
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/70 max-w-md leading-[2.2] font-sans">
            Personalize multiple premium products simultaneously. Choose a pre-made preset welcome kit or assemble your own bespoke custom gift boxes.
          </p>
        </div>
        
        {/* Toggle Preset / Custom Switcher */}
        <div className="flex gap-4 border border-[#8F9C86]/20 p-2 rounded-full bg-[#FAF6EE]">
          <button 
            onClick={() => setActiveTab('PRESET')}
            className={`px-6 py-3 rounded-full text-xs uppercase tracking-[0.2em] font-bold cursor-pointer transition-all duration-300 ${
              activeTab === 'PRESET' ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow-sm' : 'text-[#1F2B1A]/60 hover:text-[#1F2B1A]'
            }`}
          >
            Preset Suites
          </button>
          <button 
            onClick={() => setActiveTab('CUSTOM')}
            className={`px-6 py-3 rounded-full text-xs uppercase tracking-[0.2em] font-bold cursor-pointer transition-all duration-300 ${
              activeTab === 'CUSTOM' ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow-sm' : 'text-[#1F2B1A]/60 hover:text-[#1F2B1A]'
            }`}
          >
            Custom Builder
          </button>
        </div>
      </header>

      {activeTab === 'PRESET' ? (
        /* Redesigned Premium Preset Bundles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {presetBundles.map((bundle) => (
            <div 
              key={bundle.id} 
              className="bg-[#F5F1E6]/25 hover:bg-[#FAF9F5] border border-[#8F9C86]/12 hover:border-[#D27D5B] rounded-[2.2rem] p-8 flex flex-col justify-between transition-all duration-500 shadow-sm hover:shadow-2xl relative group"
            >
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex justify-between items-start border-b border-[#8F9C86]/10 pb-4">
                  <div className="space-y-1">
                    <span className="inline-block text-[8px] uppercase tracking-widest text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-3 py-1.5 rounded-full border border-[#D27D5B]/20">
                      Curated Preset
                    </span>
                    <h3 className="font-serif text-2xl lg:text-3xl text-[#1F2B1A] group-hover:text-[#D27D5B] transition-colors uppercase tracking-tight leading-tight mt-3">
                      {bundle.name}
                    </h3>
                  </div>
                  <span className="font-serif text-2xl font-bold text-[#1F2B1A]">${bundle.price.toFixed(2)}</span>
                </div>

                {/* Included components listing */}
                <div className="space-y-4">
                  <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono font-bold block">
                    Included Components:
                  </span>
                  <div className="divide-y divide-[#8F9C86]/10">
                    {bundle.items.map((item, idx) => (
                      <div key={idx} className="py-3.5 flex items-center gap-4">
                        <div className="w-12 h-14 bg-[#FAF9F5] rounded-xl overflow-hidden border border-[#8F9C86]/10 flex-shrink-0 relative">
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply opacity-85" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <span className="text-xs uppercase tracking-wider text-[#1F2B1A] font-bold block truncate">{item.productName}</span>
                          <span className="text-[9px] uppercase tracking-widest font-mono text-[#1F2B1A]/40 block mt-1">Quantity: {item.quantity} unit(s)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons split */}
              <div className="pt-8 border-t border-[#8F9C86]/15 mt-8 space-y-3">
                <Link 
                  href={`/catalog/bundle/${bundle.id}`}
                  className="w-full py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 shadow-md flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  Configure & Brand Bundle <ArrowRight className="w-4 h-4 animate-bounce-horizontal" />
                </Link>
                <button
                  onClick={() => handleModifyPreset(bundle)}
                  className="w-full py-3 bg-transparent border border-[#1F2B1A]/20 text-[#1F2B1A] text-xs tracking-[0.2em] uppercase font-bold rounded-full hover:bg-[#1F2B1A]/5 hover:border-[#1F2B1A] transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Modify Package Elements
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Redesigned Custom Bundle Builder Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pb-16">
          
          {/* Left Panel: Available Products grid */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight">Available Elements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((prod) => {
                const qty = selectedItems[prod.id] || 0;
                const images = prod.images as string[];
                const imageUrl = images?.[0] || '';

                return (
                  <div 
                    key={prod.id} 
                    className={`border rounded-[2rem] p-5 flex gap-5 transition-all duration-300 bg-[#F5F1E6]/20 hover:bg-[#FAF9F5] ${
                      qty > 0 ? 'border-[#D27D5B] shadow-md bg-[#FAF9F5]/40' : 'border-[#8F9C86]/15'
                    }`}
                  >
                    <div className="w-20 h-24 bg-[#FAF9F5] rounded-2xl border border-[#8F9C86]/10 overflow-hidden flex-shrink-0 relative">
                      <img src={imageUrl} alt={prod.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between min-w-0 py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[8px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono font-bold block">{prod.sku}</span>
                          <span className="text-[10px] font-mono font-bold text-[#1F2B1A]/70">${prod.basePrice.toFixed(2)}</span>
                        </div>
                        <h4 className="font-serif text-base text-[#1F2B1A] uppercase tracking-tight leading-snug mt-1 truncate">{prod.name}</h4>
                        <span className="text-[8px] uppercase tracking-widest text-[#D27D5B] font-bold bg-[#D27D5B]/5 px-2.5 py-0.5 rounded-full mt-2 inline-block border border-[#D27D5B]/10">{prod.category}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        {qty > 0 ? (
                          <>
                            <button 
                              onClick={() => handleRemoveProduct(prod.id)}
                              className="w-7 h-7 rounded-full border border-[#8F9C86]/30 flex items-center justify-center text-[#1F2B1A]/60 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] hover:border-transparent transition-colors cursor-pointer"
                            >
                              <Minus className="w-3" />
                            </button>
                            <span className="text-xs uppercase font-bold tracking-widest text-[#1F2B1A] font-mono">{qty}</span>
                            <button 
                              onClick={() => handleAddProduct(prod.id)}
                              className="w-7 h-7 rounded-full border border-[#8F9C86]/30 flex items-center justify-center text-[#1F2B1A]/60 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] hover:border-transparent transition-colors cursor-pointer"
                            >
                              <Plus className="w-3" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleAddProduct(prod.id)}
                            className="px-4 py-1.5 border border-[#1F2B1A]/20 text-[#1F2B1A] text-[9px] uppercase tracking-widest font-bold rounded-full hover:bg-[#1F2B1A] hover:text-[#FAF6EE] hover:border-transparent transition-all cursor-pointer bg-[#FAF9F5]"
                          >
                            + Add Item
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Sticky custom bundle summary */}
          <div className="lg:col-span-5 border border-[#8F9C86]/15 bg-[#FAF9F5] p-8 rounded-[2.2rem] space-y-8 lg:sticky lg:top-28 shadow-sm">
            <div>
              <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-2">
                BESPOKE COMPOSITION
              </span>
              <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">
                Custom <span className="italic font-light lowercase text-[#D27D5B]">packaging</span>
              </h3>
            </div>

            {errorMsg && (
              <div className="border border-red-500/20 bg-red-500/5 px-6 py-4 text-xs uppercase tracking-widest text-red-700 font-bold rounded-xl animate-bloom">
                🌿 ERROR: {errorMsg}
              </div>
            )}

            <div className="space-y-6">
              {/* Custom Suite Name Input */}
              <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1 group-focus-within:text-[#D27D5B]">
                  Signature Suite Name
                </label>
                <input 
                  type="text" 
                  className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                  placeholder="E.G., Q4 EXECUTIVE THANK-YOU KIT"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              {/* Selected List */}
              <div className="space-y-3 pt-4">
                <span className="block text-[8px] uppercase tracking-widest text-[#1F2B1A]/50 font-sans font-bold">
                  Assembled Suite Elements ({customItemCount})
                </span>
                
                {customItemCount === 0 ? (
                  <div className="py-8 text-center border border-dashed border-[#8F9C86]/20 rounded-2xl bg-[#F5F1E6]/25 text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 font-bold italic">
                    Composition empty. Select products from left grid.
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto border border-[#8F9C86]/12 rounded-2xl p-4 space-y-3 bg-[#FAF6EE]/50 divide-y divide-[#8F9C86]/10 pr-2">
                    {Object.entries(selectedItems).map(([pId, qty]) => {
                      const prod = products.find(p => p.id === pId);
                      if (!prod) return null;
                      return (
                        <div key={pId} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#1F2B1A] block uppercase tracking-wider">{prod.name}</span>
                            <span className="text-[10px] text-[#1F2B1A]/50 block mt-0.5 font-mono">
                              {qty} unit(s) &bull; ${(prod.basePrice * qty).toFixed(2)}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleRemoveProduct(prod.id)}
                            className="text-[#D27D5B] hover:text-[#1F2B1A] p-1 font-bold text-[10px] uppercase tracking-widest border-0 bg-transparent cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pricing Math */}
              <div className="space-y-3 border-t border-[#8F9C86]/15 pt-6 text-[10px] uppercase tracking-widest font-bold text-[#1F2B1A]/70">
                <div className="flex justify-between font-medium">
                  <span>Raw Composition Sum</span>
                  <span className="text-[#1F2B1A] font-mono">${rawTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-[#D27D5B]">
                  <span>10% Workstation Discount</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base pt-3 border-t border-[#8F9C86]/10 text-[#1F2B1A]">
                  <span className="font-serif text-[#1F2B1A]">Suite Price</span>
                  <span className="font-serif text-lg font-bold text-[#1F2B1A]">${customBundlePrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleLaunchCustomBundle}
                disabled={isCreatingCustom || customItemCount < 2 || !customName}
                className="w-full py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-1.5 cursor-pointer border-0"
              >
                {isCreatingCustom ? 'Locking Parameters...' : 'Save & Customize Suite'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 justify-center text-[9px] uppercase tracking-[0.3em] font-bold text-[#1F2B1A]/40 mt-4">
                <ShieldCheck className="w-4 h-4 text-[#8F9C86]" />
                AES-256 Workspace protection active
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
