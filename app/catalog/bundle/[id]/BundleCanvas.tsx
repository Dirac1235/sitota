'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Package, Sparkles, HelpCircle, ArrowRight, Clipboard, Trash, Check, ArrowLeft } from 'lucide-react';

interface BundleProduct {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  basePrice: number;
  category: string;
  sku: string;
  description: string | null;
}

interface Bundle {
  id: string;
  name: string;
  price: number;
  type: string;
  items: BundleProduct[];
}

export default function BundleCanvas({ bundle }: { bundle: Bundle }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Configuration Canvas States
  const [prompt, setPrompt] = useState('');
  const [textLine1, setTextLine1] = useState('');
  const [textLine2, setTextLine2] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [placementHint, setPlacementHint] = useState('Center');
  const [textColor, setTextColor] = useState('Auto');
  const [fontStyleHint, setFontStyleHint] = useState('Auto');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [designId, setDesignId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bundleId: bundle.id,
          intentPrompt: prompt,
          logoUrl, // Pass base64 logo to backend
          textLine1,
          textLine2,
          giftMessage,
          placementHint,
          textColor,
          fontStyleHint,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPreviewUrl(data.previewUrl);
        setInterpretation(data.interpretation);
        setDesignId(data.designId);
        setPreviewGenerated(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = () => {
    if (!session) {
      router.push(`/login?callbackUrl=/catalog/bundle/${bundle.id}`);
      return;
    }
    router.push(`/checkout?designId=${designId}`);
  };

  // Pre-loaded template suggestions
  const handleSuggestion = () => {
    setPrompt("Cohesive corporate alignment. Soft white logo centered symmetrically with matte bronze text across elements. Luxury unboxing feel.");
  };

  return (
    <div className="w-full flex flex-col min-h-screen animate-bloom bg-transparent">
      
      {/* Top Header */}
      <div className="w-full border-b border-[#8F9C86]/10 flex justify-between items-center p-5 lg:px-12 bg-[#FAF6EE]">
        <Link href="/catalog/bundles" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A] hover:text-[#D27D5B] transition-colors flex items-center gap-2">
          &larr; Return to Bundles
        </Link>
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40">
          Studio Bundle Customizer / {bundle.name.slice(0, 15).toUpperCase()}
        </div>
      </div>

      {/* Main Layout Split */}
      <div className="flex flex-col lg:flex-row flex-grow w-full items-stretch">
        
        {/* Left Panel - Configuration & List of items */}
        <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#8F9C86]/15 bg-[#FAF6EE]">
          
          {/* Bundle Info Section */}
          <div className="p-8 lg:p-12 border-b border-[#8F9C86]/15 bg-[#F5F1E6]/20 space-y-6">
            <div className="flex justify-between items-start">
              <span className="inline-block text-xs uppercase tracking-[0.2em] text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-3.5 py-1.5 rounded-full">
                Suite Package &bull; {bundle.type}
              </span>
              <span className="font-serif text-3xl font-bold text-[#1F2B1A]">${bundle.price.toFixed(2)}</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              {bundle.name}
            </h1>

            {/* List of elements inside the bundle */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono font-bold block">
                Assembled Bundle Cohort Elements:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bundle.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-[#FAF6EE]/75 border border-[#8F9C86]/10 p-2.5 rounded-xl text-xs">
                    <div className="w-8 h-10 bg-white/40 border border-[#8F9C86]/5 rounded overflow-hidden flex-shrink-0">
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply opacity-85" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#1F2B1A] uppercase truncate block tracking-wider">{item.productName}</span>
                      <span className="text-[9px] text-[#1F2B1A]/50 block mt-0.5">{item.quantity} unit(s) &bull; {item.sku}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Customizer Inputs */}
          <div className="p-8 lg:p-12 flex-grow flex flex-col gap-8 bg-[#FAF6EE]">
            
            {/* Intent Prompt */}
            <div className="relative border border-[#8F9C86]/25 rounded-2xl bg-[#F5F1E6]/30 overflow-hidden group focus-within:border-[#D27D5B]/70 transition-colors">
              <div className="absolute top-3 left-4 text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50">
                Cohesive Creative Directive (Intent Prompt)
              </div>
              <textarea
                className="w-full h-32 pt-9 px-4 pb-3 bg-transparent text-xs font-sans uppercase tracking-widest leading-[2] text-[#1F2B1A] focus:outline-none resize-none placeholder:text-[#1F2B1A]/30"
                placeholder="DESCRIBE HOW YOUR BRANDING WILL UNITE THE PACK. E.G., 'A MINIMAL EMBLEM WRAPPED SYMMETRICALLY.'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="border-t border-[#8F9C86]/15 flex justify-between items-center px-4 py-2.5 bg-[#F5F1E6]/40">
                <button 
                  onClick={handleSuggestion}
                  className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B] hover:text-[#1F2B1A] transition-colors"
                >
                  🍃 Symmetrize Suite
                </button>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40">
                  {prompt.length}/500
                </span>
              </div>
            </div>

            {/* Logo upload + Text fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <label 
                htmlFor="bundle-logo-upload"
                className="relative border border-dashed border-[#8F9C86]/40 rounded-2xl bg-[#FAF9F5]/40 flex flex-col justify-center items-center p-6 cursor-pointer hover:bg-[#1F2B1A] hover:text-[#FAF6EE] transition-all duration-500 group shadow-sm text-center"
              >
                <input 
                  type="file" 
                  id="bundle-logo-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload} 
                />
                {logoUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={logoUrl} alt="Logo thumbnail" className="w-12 h-12 object-contain mb-2 grayscale" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A] group-hover:text-[#FAF6EE]">Replace Asset</span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A] group-hover:text-[#FAF6EE] mb-2">Upload Logo</span>
                    <span className="text-xs uppercase tracking-widest text-[#1F2B1A]/50 group-hover:text-[#FAF6EE]/70 font-bold">SVG / PNG / 10MB</span>
                  </>
                )}
              </label>

              <div className="flex flex-col gap-6">
                <div className="relative border-b border-[#8F9C86]/20 pb-1 group focus-within:border-[#D27D5B]">
                  <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Line 01 (Primary)</label>
                  <input
                    type="text"
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="COHORT INSCRIPTION"
                    value={textLine1}
                    onChange={(e) => setTextLine1(e.target.value)}
                  />
                </div>
                <div className="relative border-b border-[#8F9C86]/20 pb-1 group focus-within:border-[#D27D5B]">
                  <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Line 02 (Secondary)</label>
                  <input
                    type="text"
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="TAGLINE OR DATE"
                    value={textLine2}
                    onChange={(e) => setTextLine2(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Toggle */}
            <div className="border-t border-[#8F9C86]/10 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                {showAdvanced ? '▼ Hide Advanced Options' : '▶ Show Advanced Options'}
              </button>
              
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 animate-fade-in pb-2">
                  <div className="relative border-b border-[#8F9C86]/20 pb-1">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Logo Placement</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                      value={placementHint}
                      onChange={(e) => setPlacementHint(e.target.value)}
                    >
                      <option value="Center">Center Symmetrical</option>
                      <option value="Left Chest">Left Chest Corner</option>
                      <option value="Right Chest">Right Chest Corner</option>
                      <option value="Sleeve">Sleeve / Edge</option>
                      <option value="Back">Back / Large centered</option>
                    </select>
                  </div>

                  <div className="relative border-b border-[#8F9C86]/20 pb-1">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Branding Color</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    >
                      <option value="Auto">Auto (Contrast-Optimized)</option>
                      <option value="Gold">Metallic Gold</option>
                      <option value="Silver">Metallic Silver</option>
                      <option value="White">Matte White</option>
                      <option value="Black">Matte Black</option>
                      <option value="Terracotta">Terracotta</option>
                    </select>
                  </div>

                  <div className="relative border-b border-[#8F9C86]/20 pb-1">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Typography Font</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                      value={fontStyleHint}
                      onChange={(e) => setFontStyleHint(e.target.value)}
                    >
                      <option value="Auto">Auto Match</option>
                      <option value="Serif">Serif (Classic & Bold)</option>
                      <option value="Sans-serif">Sans-serif (Modern Minimal)</option>
                      <option value="Script">Script (Elegant Hand)</option>
                      <option value="Bold Display">Bold Editorial</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isGenerating ? 'Rendering Custom Suite Collection...' : 'Execute Harmonized Rendering'}
            </button>
            
          </div>
        </div>

        {/* Right Panel - Flat lay Proof Rendering */}
        <div className="w-full lg:w-[55%] bg-[#1F2B1A] relative flex flex-col justify-center items-center p-6 lg:p-16 overflow-hidden">
          
          {/* Symmetrized grid backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(210,125,91,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(210,125,91,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          <div className="relative w-full max-w-2xl aspect-square border border-[#8F9C86]/15 bg-[#FAF6EE] p-6 lg:p-12 rounded-[2rem] shadow-2xl flex flex-col">
            {!previewGenerated ? (
              <div className="w-full h-full border border-[#1F2B1A]/5 rounded-[1.5rem] flex flex-col items-center justify-center relative bg-[#F5F1E6]/40">
                 <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
                   <span className="font-serif italic text-[11rem] text-[#1F2B1A]">unboxing.</span>
                 </div>
                 <div className="text-center z-10 space-y-4 px-6">
                    <div className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A]">
                       Chamber Box Viewport
                    </div>
                    <div className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 max-w-xs mx-auto leading-[2] font-semibold">
                      Provide parameters on the left to render your branded unboxing box arrangement.
                    </div>
                 </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col relative group rounded-[1.5rem] overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Custom Suite Render"
                  className="w-full h-full object-cover transition-all duration-[2s] ease-out filter sepia-[0.03]"
                />
                
                {/* Proof logs */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#FAF6EE] border-t border-[#8F9C86]/10 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-4">
                     <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-pulse"></span>
                     <div>
                       <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 block mb-1">Suite Rendering Logs</span>
                       <span className="text-xs uppercase tracking-widest text-[#1F2B1A] leading-snug block font-bold">
                         {interpretation}
                       </span>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {previewGenerated && (
            <div className="mt-12 flex w-full max-w-2xl gap-4 relative z-10">
              <button className="flex-1 py-4.5 border border-[#FAF6EE]/20 text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300">
                Download Proof Document
              </button>
              <button 
                onClick={handleApprove}
                className="flex-1 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 shadow-md animate-bounce-short"
              >
                Approve & Continue Checkout
              </button>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}
