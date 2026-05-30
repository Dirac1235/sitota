'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Upload, Sparkles, Image as ImageIcon, Download, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  basePrice: number;
  images: any;
}

export default function Canvas({ product }: { product: Product }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');
  const [textLine1, setTextLine1] = useState('');
  const [textLine2, setTextLine2] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [placementHint, setPlacementHint] = useState('Center');
  const [textColor, setTextColor] = useState('Auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [designId, setDesignId] = useState('');

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
          textLine1,
          textLine2,
          giftMessage,
          placementHint,
          textColor,
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
      router.push(`/login?callbackUrl=/catalog/${product.id}`);
      return;
    }
    router.push(`/checkout?designId=${designId}`);
  };

  const parsedImages = product.images ? (product.images as string[]) : [];
  const baseImageUrl = parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
      <div className="mb-10">
        <Link href="/catalog" className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1c1c1c]/50 hover:text-[#1c1c1c] transition-colors">
          &larr; Back to Curated Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Panel - Customization Controls */}
        <div className="space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#8B7355] block mb-2">{product.category}</span>
            <h1 className="font-serif text-3xl md:text-4xl text-[#1c1c1c] mb-4">{product.name}</h1>
            <p className="text-sm font-light text-[#1c1c1c]/70 leading-relaxed mb-6">{product.description}</p>
            <p className="font-serif text-xl font-light text-[#1c1c1c]">${product.basePrice.toFixed(2)}</p>
          </div>

          <div className="border-t border-[#1c1c1c]/10 pt-8 space-y-6">
            {/* Intent & Preference Prompt */}
            <div className="bg-[#FAF8F5] p-6 border border-[#1c1c1c]/5">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#1c1c1c] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8B7355]" /> Describe your vision
                </label>
                <button 
                  onClick={() => setPrompt("I want our logo beautifully centered in copper/gold text on the dark navy backdrop. Minimalist and luxury-focused.")}
                  className="text-[10px] uppercase tracking-wider text-[#8B7355] hover:text-[#1c1c1c] transition-colors font-semibold"
                >
                  Inspire me
                </button>
              </div>
              <textarea
                className="w-full h-24 p-4 border border-[#1c1c1c]/10 rounded-none bg-white text-sm focus:outline-none focus:border-[#1c1c1c] transition-colors"
                placeholder="Tell us what you have in mind — e.g., 'Logo centered on front, tagline below it in gold...'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="mt-3 flex justify-between items-center text-[10px] text-[#1c1c1c]/40 font-semibold uppercase tracking-wider">
                <span>Clarity: <span className="text-green-600 font-bold">● Detailed</span></span>
                <span>{prompt.length}/500</span>
              </div>
            </div>

            {/* Structured Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-dashed border-[#1c1c1c]/20 hover:border-[#1c1c1c] transition-colors p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50/50">
                <Upload className="w-6 h-6 text-[#1c1c1c]/40 mb-3" />
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1c1c1c]">Upload Brand Logo</span>
                <span className="text-[9px] text-[#1c1c1c]/40 mt-1 uppercase tracking-wider font-semibold">PNG, SVG up to 10MB</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-[#1c1c1c]/60 mb-2">Text Line 1</label>
                  <input
                    type="text"
                    placeholder="E.g., Company Name"
                    className="w-full px-4 py-3 border border-[#1c1c1c]/10 rounded-none text-sm focus:outline-none focus:border-[#1c1c1c] bg-white transition-colors"
                    value={textLine1}
                    onChange={(e) => setTextLine1(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-[#1c1c1c]/60 mb-2">Text Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="E.g., Tagline"
                    className="w-full px-4 py-3 border border-[#1c1c1c]/10 rounded-none text-sm focus:outline-none focus:border-[#1c1c1c] bg-white transition-colors"
                    value={textLine2}
                    onChange={(e) => setTextLine2(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-[#1c1c1c]/60 mb-2">Gift message</label>
              <textarea
                className="w-full h-16 p-4 border border-[#1c1c1c]/10 rounded-none bg-white text-sm focus:outline-none focus:border-[#1c1c1c] transition-colors"
                placeholder="Included inside the packaging insert note..."
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-[#1c1c1c] text-[#FDFBF7] text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#333] transition-colors duration-500 disabled:opacity-50"
            >
              {isGenerating ? 'Generating Luxury Render...' : 'Generate Preview'}
            </button>
          </div>
        </div>

        {/* Right Panel - Render Preview */}
        <div className="flex flex-col h-full justify-start">
          <div className="aspect-[4/5] w-full bg-[#f0eee9] border border-[#1c1c1c]/10 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {!previewGenerated ? (
              <div className="text-center max-w-xs space-y-4">
                <ImageIcon className="w-12 h-12 mx-auto text-[#1c1c1c]/30 stroke-[1.2]" />
                <h3 className="font-serif text-lg text-[#1c1c1c]">Visual Studio</h3>
                <p className="text-xs text-[#1c1c1c]/50 leading-relaxed font-light">
                  Input your branding specifications, and our AI design engine will synthesize your concepts photorealistically.
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <img
                  src={previewUrl}
                  alt="AI concept render"
                  className="w-full h-full object-cover transition-all duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 bg-[#FDFBF7]/90 p-6 border-t border-[#1c1c1c]/5">
                  <p className="text-xs font-light text-[#1c1c1c]/70 text-center leading-relaxed">
                    <span className="font-bold uppercase tracking-wider text-[9px] block text-[#8B7355] mb-1">AI Render Output</span>
                    {interpretation}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {previewGenerated && (
            <div className="mt-8 flex gap-4 justify-end">
              <button className="flex items-center gap-2 px-6 py-3 border border-[#1c1c1c]/20 text-[11px] uppercase tracking-wider font-semibold text-[#1c1c1c]/70 hover:border-[#1c1c1c] hover:text-[#1c1c1c] transition-all">
                <Download className="w-4 h-4" /> Save Proof
              </button>
              <button 
                onClick={handleApprove}
                className="flex items-center gap-2 px-8 py-3 bg-[#1c1c1c] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#333] transition-colors"
              >
                <Check className="w-4 h-4" /> Approve Proof
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
