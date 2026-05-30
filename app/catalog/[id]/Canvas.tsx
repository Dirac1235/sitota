'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  basePrice: number;
  sku: string;
  images: any;
}

export default function Canvas({ product }: { product: Product }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');
  const [textLine1, setTextLine1] = useState('');
  const [textLine2, setTextLine2] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [placementHint, setPlacementHint] = useState('Center');
  const [textColor, setTextColor] = useState('Auto');
  const [fontStyleHint, setFontStyleHint] = useState('Auto');
  const [backgroundTreatment, setBackgroundTreatment] = useState('No Change');
  const [customBackgroundHex, setCustomBackgroundHex] = useState('#FAF6EE');
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
          productId: product.id,
          intentPrompt: prompt,
          logoUrl, // Pass base64 uploaded logo to backend
          textLine1,
          textLine2,
          giftMessage,
          placementHint,
          textColor,
          fontStyleHint, // Pass font style to backend
          backgroundTreatment,
          customBackgroundHex: backgroundTreatment === 'Solid Color Fill' ? customBackgroundHex : undefined,
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

  const isFromVault = searchParams.get('from') === 'vault';

  const handleApprove = () => {
    if (!session) {
      router.push(`/login?callbackUrl=/catalog/${product.id}${isFromVault ? '?from=vault' : ''}`);
      return;
    }
    if (isFromVault) {
      router.push('/dashboard?tab=vault');
    } else {
      router.push(`/checkout?designId=${designId}`);
    }
  };

  const parsedImages = product.images ? (product.images as string[]) : [];
  const baseImageUrl = parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="w-full flex flex-col min-h-screen animate-bloom">
      
      {/* Top Header */}
      <div className="w-full border-b border-[#8F9C86]/10 flex justify-between items-center p-5 lg:px-12 bg-[#FAF6EE]">
        <Link href="/catalog" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A] hover:text-[#D27D5B] transition-colors flex items-center gap-2">
          &larr; Return to Index
        </Link>
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40">
          Studio Workstation / {product.sku}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row flex-grow w-full items-stretch">
        
        {/* Left Panel - Inputs (Form) */}
        <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#8F9C86]/15 bg-[#FAF6EE]">
          
          {/* Product Info Section */}
          <div className="p-8 lg:p-12 border-b border-[#8F9C86]/15 bg-[#F5F1E6]/20">
            <span className="inline-block text-xs uppercase tracking-[0.2em] text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-3.5 py-1.5 rounded-full mb-4">
              {product.category} — {product.sku}
            </span>
            <h1 className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] mb-4 uppercase tracking-tight leading-none">
              {product.name}
            </h1>
            <p className="text-sm font-sans text-[#1F2B1A]/70 uppercase tracking-widest leading-[2.2] mb-8">
              {product.description}
            </p>
            <div className="flex justify-between items-end border-t border-[#8F9C86]/15 pt-6">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50">Unit Value</span>
              <span className="font-serif text-3xl font-bold text-[#1F2B1A]">${product.basePrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="p-8 lg:p-12 flex-grow flex flex-col gap-8 bg-[#FAF6EE]">
            
            {/* Intent Prompt */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">// Step 01 — Describe Your Vision</label>
                <button 
                  onClick={() => setPrompt("Botanical luxury. Soft olive branch crest centered elegantly in terracotta tones.")}
                  className="text-xs uppercase tracking-[0.2em] font-bold text-[#D27D5B] hover:text-[#1F2B1A] transition-colors cursor-pointer"
                >
                  ✨ Suggest Direction
                </button>
              </div>

              <div className="relative border border-[#8F9C86]/25 rounded-2xl bg-[#F5F1E6]/30 overflow-hidden focus-within:border-[#D27D5B]/70 transition-colors">
                <textarea
                  className="w-full h-32 pt-4 px-4 pb-3 bg-transparent text-xs font-sans uppercase tracking-widest leading-[2] text-[#1F2B1A] focus:outline-none resize-none placeholder:text-[#1F2B1A]/30"
                  placeholder="DEFINE YOUR VISION. E.G., 'A SEEDLING MOTIF CENTERED ON BACK WITH TERRASCOTTA TEXT.'"
                  value={prompt}
                  maxLength={500}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="border-t border-[#8F9C86]/15 flex justify-between items-center px-4 py-2.5 bg-[#F5F1E6]/40">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-[#1F2B1A]/50">Natural Creative Brief</span>
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40">
                    {prompt.length}/500
                  </span>
                </div>
              </div>

              {/* Clarity Score Banner (Section 2.2 - Step 1) */}
              {(() => {
                const getClarityScore = (text: string) => {
                  const trimmed = text.trim();
                  if (trimmed.length === 0) {
                    return { 
                      label: 'Low', 
                      color: 'text-red-600 border-red-200 bg-red-500/10', 
                      tip: 'Try describing some details, like logo placement or your preferred colors.' 
                    };
                  }
                  if (trimmed.length < 25) {
                    return { 
                      label: 'Low', 
                      color: 'text-red-600 border-red-200 bg-red-500/10', 
                      tip: 'Add a color preference or where you\'d like the logo placed.' 
                    };
                  }
                  if (trimmed.length < 65) {
                    return { 
                      label: 'Good', 
                      color: 'text-[#D27D5B] border-[#D27D5B]/20 bg-[#D27D5B]/10', 
                      tip: 'Nice — mention the occasion or mood to help refine the visual tone.' 
                    };
                  }
                  return { 
                    label: 'Detailed', 
                    color: 'text-green-600 border-green-200 bg-green-600/10', 
                    tip: 'Great — your preview should match closely.' 
                  };
                };
                const clarity = getClarityScore(prompt);
                return (
                  <div className={`border p-4 rounded-xl flex items-start gap-3 transition-colors ${clarity.color}`}>
                    <span className="w-2 h-2 bg-current rounded-full mt-1.5 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold block">Prompt Clarity: {clarity.label}</span>
                      <span className="text-[10px] uppercase tracking-wider block font-sans opacity-80 leading-normal">{clarity.tip}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Asset Upload & Text Lines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <label 
                htmlFor="logo-upload"
                className="relative border border-dashed border-[#8F9C86]/40 rounded-2xl bg-[#FAF9F5]/40 flex flex-col justify-center items-center p-6 cursor-pointer hover:bg-[#1F2B1A] hover:text-[#FAF6EE] transition-all duration-500 group shadow-sm text-center"
              >
                <input 
                  type="file" 
                  id="logo-upload" 
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
                    placeholder="CREST INSCRIPTION"
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

            {/* Step 4: Gift Message Insert Card (Section 2.2 - Step 4) */}
            <div className="space-y-3 border-t border-[#8F9C86]/15 pt-6">
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">// Step 04 — Packaging Insert message (Not Printed)</label>
              <div className="relative border border-[#8F9C86]/25 rounded-2xl bg-[#F5F1E6]/10 overflow-hidden focus-within:border-[#D27D5B]/70 transition-colors">
                <textarea
                  className="w-full h-24 pt-4 px-4 pb-3 bg-transparent text-xs font-sans uppercase tracking-widest leading-[2] text-[#1F2B1A] focus:outline-none resize-none placeholder:text-[#1F2B1A]/30"
                  placeholder="Write a personal note that accompanies the gift inside the unboxing box..."
                  value={giftMessage}
                  maxLength={200}
                  onChange={(e) => setGiftMessage(e.target.value)}
                />
                <div className="border-t border-[#8F9C86]/15 flex justify-between items-center px-4 py-2 bg-[#F5F1E6]/40 text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold">
                  <span>This insert note will not be printed on items.</span>
                  <span>{giftMessage.length}/200</span>
                </div>
              </div>
            </div>

            {/* Advanced Options Toggle */}
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
                      <option value="Center">Center</option>
                      <option value="Left Chest">Left Chest</option>
                      <option value="Right Chest">Right Chest</option>
                      <option value="Sleeve">Sleeve</option>
                      <option value="Back">Back</option>
                    </select>
                  </div>

                  <div className="relative border-b border-[#8F9C86]/20 pb-1">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Text Color</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    >
                      <option value="Auto">Auto (Contrast)</option>
                      <option value="Gold">Metallic Gold</option>
                      <option value="Silver">Metallic Silver</option>
                      <option value="White">Matte White</option>
                      <option value="Black">Matte Black</option>
                      <option value="Terracotta">Terracotta</option>
                    </select>
                  </div>

                  <div className="relative border-b border-[#8F9C86]/20 pb-1">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Font Style</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                      value={fontStyleHint}
                      onChange={(e) => setFontStyleHint(e.target.value)}
                    >
                      <option value="Auto">Auto</option>
                      <option value="Serif">Serif (Classic)</option>
                      <option value="Sans-serif">Sans-serif (Modern)</option>
                      <option value="Script">Script (Elegant)</option>
                      <option value="Bold Display">Bold Display</option>
                    </select>
                  </div>

                  <div className="relative border-b border-[#8F9C86]/20 pb-1">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Background Treatment</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer text-ellipsis overflow-hidden"
                      value={backgroundTreatment}
                      onChange={(e) => setBackgroundTreatment(e.target.value)}
                    >
                      <option value="No Change">No Change (Original)</option>
                      <option value="Subtle Pattern">Subtle Pattern</option>
                      <option value="Solid Color Fill">Solid Color Fill</option>
                    </select>
                  </div>

                  {backgroundTreatment === 'Solid Color Fill' && (
                    <div className="md:col-span-3 relative border-b border-[#8F9C86]/20 pb-1.5 animate-fade-in flex items-center gap-4 mt-2">
                      <div className="flex-grow">
                        <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Background Solid Hex</label>
                        <input
                          type="text"
                          className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                          placeholder="#FAF6EE"
                          value={customBackgroundHex}
                          onChange={(e) => setCustomBackgroundHex(e.target.value)}
                        />
                      </div>
                      <input 
                        type="color" 
                        className="w-8 h-8 rounded-full border border-[#8F9C86]/20 cursor-pointer overflow-hidden p-0"
                        value={customBackgroundHex.startsWith('#') && customBackgroundHex.length === 7 ? customBackgroundHex : '#FAF6EE'}
                        onChange={(e) => setCustomBackgroundHex(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isGenerating ? 'Rendering Custom Asset...' : 'Execute Rendering'}
            </button>
            
          </div>
        </div>

        {/* Right Panel - Render Preview */}
        <div className="w-full lg:w-[55%] bg-[#1F2B1A] relative flex flex-col justify-center items-center p-6 lg:p-16 overflow-hidden">
          
          {/* Glowing amber/gold soft organic grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(210,125,91,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(210,125,91,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          <div className="relative w-full max-w-2xl aspect-square border border-[#8F9C86]/15 bg-[#FAF6EE] p-6 lg:p-12 rounded-[2rem] shadow-2xl flex flex-col">
            {!previewGenerated ? (
              <div className="w-full h-full border border-[#1F2B1A]/5 rounded-[1.5rem] flex flex-col items-center justify-center relative bg-[#F5F1E6]/40">
                 <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
                   <span className="font-serif italic text-[11rem] text-[#1F2B1A]">s.</span>
                 </div>
                 <div className="text-center z-10 space-y-4 px-6">
                   <div className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A]">
                      Chamber Viewport
                   </div>
                   <div className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 max-w-xs mx-auto leading-[2] font-semibold">
                     Awaiting parameter inputs to organize custom botanical proof.
                   </div>
                 </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col relative group rounded-[1.5rem] overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Custom render"
                  className="w-full h-full object-cover transition-all duration-[2s] ease-out filter sepia-[0.03]"
                />
                
                {/* Proof overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#FAF6EE] border-t border-[#8F9C86]/10 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-4">
                     <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-pulse"></span>
                     <div>
                       <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 block mb-1">Rendering Logs</span>
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
                Download Proof
              </button>
              <button 
                onClick={handleApprove}
                className="flex-1 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isFromVault ? "Save Design & Exit to Vault" : "Approve & Continue"}
              </button>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}
