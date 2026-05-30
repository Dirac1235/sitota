'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Package, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Clipboard, 
  Trash, 
  Check, 
  ArrowLeft, 
  Layers, 
  Settings, 
  Copy, 
  Eye, 
  RefreshCw, 
  Download,
  AlertCircle
} from 'lucide-react';

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

interface ItemConfig {
  prompt: string;
  logoUrl: string;
  textLine1: string;
  textLine2: string;
  giftMessage: string;
  placementHint: string;
  textColor: string;
  fontStyleHint: string;
  backgroundTreatment: string;
  customBackgroundHex: string;
  previewUrl: string;
  interpretation: string;
  designId: string;
  previewGenerated: boolean;
  isGenerating: boolean;
}

export default function BundleCanvas({ bundle }: { bundle: Bundle }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  // Customization Stage State: CHOOSE (selection screen), ALL (apply-to-all), INDIVIDUAL (item-by-item), SUMMARY (flat-lay overview)
  const [customizationMode, setCustomizationMode] = useState<'CHOOSE' | 'ALL' | 'INDIVIDUAL' | 'SUMMARY'>('CHOOSE');

  // Unified Apply-to-All States
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

  // Item-by-Item States
  const [activeIndex, setActiveIndex] = useState(0);
  const [individualConfigs, setIndividualConfigs] = useState<Record<string, ItemConfig>>({});

  // Summary Flat-Lay States
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryPreviewUrl, setSummaryPreviewUrl] = useState('');
  const [summaryDesignId, setSummaryDesignId] = useState('');
  const [summaryInterpretation, setSummaryInterpretation] = useState('');
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  const activeItem = bundle.items[activeIndex];

  // Initialize individual configs if empty
  useEffect(() => {
    if (bundle && bundle.items && Object.keys(individualConfigs).length === 0) {
      const initialConfigs: Record<string, ItemConfig> = {};
      bundle.items.forEach(item => {
        initialConfigs[item.productId] = {
          prompt: '',
          logoUrl: '',
          textLine1: '',
          textLine2: '',
          giftMessage: '',
          placementHint: 'Center',
          textColor: 'Auto',
          fontStyleHint: 'Auto',
          backgroundTreatment: 'No Change',
          customBackgroundHex: '#FAF6EE',
          previewUrl: '',
          interpretation: '',
          designId: '',
          previewGenerated: false,
          isGenerating: false
        };
      });
      setIndividualConfigs(initialConfigs);
    }
  }, [bundle]);

  // Sync state values when index changes in INDIVIDUAL mode
  useEffect(() => {
    if (customizationMode === 'INDIVIDUAL' && bundle && bundle.items && bundle.items[activeIndex]) {
      const activeProd = bundle.items[activeIndex];
      const config = individualConfigs[activeProd.productId];
      if (config) {
        setPrompt(config.prompt);
        setLogoUrl(config.logoUrl);
        setTextLine1(config.textLine1);
        setTextLine2(config.textLine2);
        setGiftMessage(config.giftMessage);
        setPlacementHint(config.placementHint);
        setTextColor(config.textColor);
        setFontStyleHint(config.fontStyleHint);
        setBackgroundTreatment(config.backgroundTreatment);
        setCustomBackgroundHex(config.customBackgroundHex);
        setPreviewUrl(config.previewUrl);
        setInterpretation(config.interpretation);
        setDesignId(config.designId);
        setPreviewGenerated(config.previewGenerated);
      }
    }
  }, [activeIndex, customizationMode, individualConfigs]);

  // Helper to dynamically update the active product's configuration mapping
  const updateActiveConfig = (field: keyof ItemConfig, value: any) => {
    if (customizationMode === 'INDIVIDUAL' && bundle && bundle.items[activeIndex]) {
      const activeProd = bundle.items[activeIndex];
      setIndividualConfigs(prev => ({
        ...prev,
        [activeProd.productId]: {
          ...prev[activeProd.productId],
          [field]: value
        }
      }));
    }
  };

  // Helper for computing Clarity Score (Section 2.2 - Step 1)
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

  // Logo file loaders
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const resBase64 = reader.result as string;
      setLogoUrl(resBase64);
      if (customizationMode === 'INDIVIDUAL') {
        updateActiveConfig('logoUrl', resBase64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (customizationMode === 'INDIVIDUAL') {
      updateActiveConfig('logoUrl', '');
    }
  };

  // Copy values from the previous item in the bundle sequence (Section 2.3)
  const handleCopyFromPrevious = () => {
    if (activeIndex === 0) return;
    const prevProd = bundle.items[activeIndex - 1];
    const prevConfig = individualConfigs[prevProd.productId];
    if (prevConfig) {
      setPrompt(prevConfig.prompt);
      setLogoUrl(prevConfig.logoUrl);
      setTextLine1(prevConfig.textLine1);
      setTextLine2(prevConfig.textLine2);
      setGiftMessage(prevConfig.giftMessage);
      setPlacementHint(prevConfig.placementHint);
      setTextColor(prevConfig.textColor);
      setFontStyleHint(prevConfig.fontStyleHint);
      setBackgroundTreatment(prevConfig.backgroundTreatment);
      setCustomBackgroundHex(prevConfig.customBackgroundHex);

      setPreviewUrl('');
      setInterpretation('');
      setDesignId('');
      setPreviewGenerated(false);

      setIndividualConfigs(prev => ({
        ...prev,
        [activeItem.productId]: {
          ...prev[activeItem.productId],
          prompt: prevConfig.prompt,
          logoUrl: prevConfig.logoUrl,
          textLine1: prevConfig.textLine1,
          textLine2: prevConfig.textLine2,
          giftMessage: prevConfig.giftMessage,
          placementHint: prevConfig.placementHint,
          textColor: prevConfig.textColor,
          fontStyleHint: prevConfig.fontStyleHint,
          backgroundTreatment: prevConfig.backgroundTreatment,
          customBackgroundHex: prevConfig.customBackgroundHex,
          previewUrl: '',
          interpretation: '',
          designId: '',
          previewGenerated: false
        }
      }));
    }
  };

  // Execute AI generation for unified 'ALL' mode or single item in 'INDIVIDUAL' mode
  const handleGenerate = async () => {
    setIsGenerating(true);
    if (customizationMode === 'INDIVIDUAL') {
      updateActiveConfig('isGenerating', true);
    }

    try {
      const requestPayload: any = {
        intentPrompt: prompt,
        logoUrl,
        textLine1,
        textLine2,
        giftMessage,
        placementHint,
        textColor,
        fontStyleHint,
        backgroundTreatment,
        customBackgroundHex: backgroundTreatment === 'Solid Color Fill' ? customBackgroundHex : undefined
      };

      if (customizationMode === 'ALL') {
        requestPayload.bundleId = bundle.id;
      } else {
        requestPayload.productId = activeItem.productId;
      }

      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPreviewUrl(data.previewUrl);
        setInterpretation(data.interpretation);
        setDesignId(data.designId);
        setPreviewGenerated(true);

        if (customizationMode === 'INDIVIDUAL') {
          setIndividualConfigs(prev => ({
            ...prev,
            [activeItem.productId]: {
              ...prev[activeItem.productId],
              prompt,
              logoUrl,
              textLine1,
              textLine2,
              giftMessage,
              placementHint,
              textColor,
              fontStyleHint,
              backgroundTreatment,
              customBackgroundHex,
              previewUrl: data.previewUrl,
              interpretation: data.interpretation,
              designId: data.designId,
              previewGenerated: true,
              isGenerating: false
            }
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
      if (customizationMode === 'INDIVIDUAL') {
        updateActiveConfig('isGenerating', false);
      }
    }
  };

  // Progress item sequence / transition to Summary Overview (Section 2.3)
  const handleApproveItem = () => {
    if (activeIndex < bundle.items.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else {
      setCustomizationMode('SUMMARY');
    }
  };

  // Generate full Package Flat-Lay summary (Section 2.3 & 4.4.6)
  const generateSummaryFlatlay = async () => {
    setIsGeneratingSummary(true);
    
    // Auto-generate cohesive flat-lay description using configurations
    const firstConfig = Object.values(individualConfigs)[0];
    const itemNamesList = bundle.items.map(item => `${item.quantity}x ${item.productName}`).join(', ');
    const firstPromptText = firstConfig?.prompt || 'A cohesive, luxury corporate-aligned gift suite';

    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: bundle.id,
          intentPrompt: `An elegant unboxed flat-lay arrangement of the '${bundle.name}' welcome box suite containing: ${itemNamesList}. Layout directive: "${firstPromptText}"`,
          logoUrl: firstConfig?.logoUrl || '',
          textLine1: firstConfig?.textLine1 || '',
          textLine2: firstConfig?.textLine2 || '',
          giftMessage: firstConfig?.giftMessage || '',
          placementHint: firstConfig?.placementHint || 'Center',
          textColor: firstConfig?.textColor || 'Auto',
          fontStyleHint: firstConfig?.fontStyleHint || 'Auto',
          backgroundTreatment: firstConfig?.backgroundTreatment || 'No Change',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSummaryPreviewUrl(data.previewUrl);
        setSummaryInterpretation(data.interpretation);
        setSummaryDesignId(data.designId);
        setSummaryGenerated(true);
      }
    } catch (err) {
      console.error('Flatlay summary generation failed:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  useEffect(() => {
    if (customizationMode === 'SUMMARY' && !summaryGenerated && !isGeneratingSummary) {
      generateSummaryFlatlay();
    }
  }, [customizationMode]);

  // Proceed directly to Checkout flow (Part 3)
  const isFromVault = searchParams.get('from') === 'vault';

  const handleApprove = () => {
    if (!session) {
      router.push(`/login?callbackUrl=/catalog/bundle/${bundle.id}${isFromVault ? '?from=vault' : ''}`);
      return;
    }
    if (isFromVault) {
      router.push('/dashboard?tab=vault');
    } else {
      const finalDesignId = customizationMode === 'SUMMARY' ? summaryDesignId : designId;
      router.push(`/checkout?designId=${finalDesignId}`);
    }
  };

  const handleInspireMe = () => {
    const inspirations = [
      "Luxury minimalism. Small logo debossed on the bottom right corner with thin golden text below it.",
      "Bright, energetic celebration layout. Wide centered white graphics offset against a subtle solid-color fill background.",
      "Corporate refinement. Central matching white badge engravings on clean, organic natural structures.",
    ];
    const randomPrompt = inspirations[Math.floor(Math.random() * inspirations.length)];
    setPrompt(randomPrompt);
    if (customizationMode === 'INDIVIDUAL') {
      updateActiveConfig('prompt', randomPrompt);
    }
  };

  // RENDER: Mode Selection Screen (Section 2.1)
  if (customizationMode === 'CHOOSE') {
    return (
      <div className="w-full min-h-[90vh] bg-[#FAF6EE] flex flex-col justify-center items-center px-6 py-12 relative animate-bloom">
        <div className="w-full max-w-4xl space-y-12 text-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-[#D27D5B] rounded-full animate-pulse"></span>
              SYS.02 — CUSTOMIZATION WORKSPACE
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none max-w-2xl mx-auto">
              How would you like to <span className="italic font-light lowercase text-[#D27D5B]">design</span> your package?
            </h1>
            <p className="text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/70 max-w-lg mx-auto leading-relaxed font-sans">
              Choose between applying a unified cohesive brand treatment to all elements simultaneously, or hand-crafting each item individually.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4 text-left">
            {/* Option 1: Apply to All */}
            <button 
              onClick={() => setCustomizationMode('ALL')}
              className="p-8 lg:p-10 bg-[#F5F1E6]/40 hover:bg-[#FAF6EE] border border-[#8F9C86]/15 hover:border-[#D27D5B] rounded-[2.5rem] flex flex-col justify-between transition-all duration-500 text-left cursor-pointer group hover:shadow-xl shadow-sm"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 bg-[#D27D5B]/10 text-[#D27D5B] rounded-full flex items-center justify-center border border-[#D27D5B]/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl lg:text-3xl text-[#1F2B1A] group-hover:text-[#D27D5B] transition-colors uppercase tracking-tight">
                    Apply to All Items
                  </h3>
                  <p className="text-[11px] uppercase tracking-wider text-[#1F2B1A]/60 font-bold">
                    Unified Cohesive Alignment
                  </p>
                </div>
                <p className="text-xs font-sans text-[#1F2B1A]/70 leading-[2.2] uppercase tracking-widest font-medium">
                  Go through the canvas once. Your logo uploads, lettering inscriptions, and visual theme directions apply to every customizable item in the bundle simultaneously. Ideal for corporate swag kits.
                </p>
              </div>
              <div className="pt-8 border-t border-[#8F9C86]/10 mt-8 flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#D27D5B]">
                Begin Unified Design <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>

            {/* Option 2: Customize Each Item */}
            <button 
              onClick={() => {
                setCustomizationMode('INDIVIDUAL');
                setActiveIndex(0);
              }}
              className="p-8 lg:p-10 bg-[#F5F1E6]/40 hover:bg-[#FAF6EE] border border-[#8F9C86]/15 hover:border-[#D27D5B] rounded-[2.5rem] flex flex-col justify-between transition-all duration-500 text-left cursor-pointer group hover:shadow-xl shadow-sm"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 bg-[#8F9C86]/20 text-[#1F2B1A] rounded-full flex items-center justify-center border border-[#8F9C86]/10">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl lg:text-3xl text-[#1F2B1A] group-hover:text-[#D27D5B] transition-colors uppercase tracking-tight">
                    Customize Each Item
                  </h3>
                  <p className="text-[11px] uppercase tracking-wider text-[#1F2B1A]/60 font-bold">
                    Bespoke Tailored Detailing
                  </p>
                </div>
                <p className="text-xs font-sans text-[#1F2B1A]/70 leading-[2.2] uppercase tracking-widest font-medium">
                  Go through the canvas item-by-item. Design each product in the bundle independently with unique text, logo placement, or distinct prompt directives. Best for highly personalized gifting.
                </p>
              </div>
              <div className="pt-8 border-t border-[#8F9C86]/10 mt-8 flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#D27D5B]">
                Begin Tailored Design <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>
          </div>

          <div className="pt-4">
            <Link href="/catalog/bundles" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors border-b border-transparent hover:border-[#D27D5B]">
              &larr; Back to Bundle Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Flat-Lay Package Summary Screen (Section 2.3)
  if (customizationMode === 'SUMMARY') {
    return (
      <div className="w-full flex flex-col min-h-screen bg-[#FAF6EE] animate-bloom">
        
        {/* Header */}
        <div className="w-full border-b border-[#8F9C86]/10 flex justify-between items-center p-5 lg:px-12">
          <button 
            onClick={() => {
              setCustomizationMode('INDIVIDUAL');
              setActiveIndex(bundle.items.length - 1);
            }}
            className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A] hover:text-[#D27D5B] transition-colors flex items-center gap-2 cursor-pointer"
          >
            &larr; Return to Individual Canvas
          </button>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40">
            Suite Package Summary / {bundle.name.toUpperCase()}
          </div>
        </div>

        <div className="flex-grow w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col lg:flex-row gap-12 items-stretch">
          
          {/* Left Panel: Package Summary & Config Cards */}
          <div className="w-full lg:w-[45%] flex flex-col justify-between space-y-8 bg-transparent">
            <div className="space-y-6">
              <span className="inline-block text-xs uppercase tracking-[0.2em] text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-3.5 py-1.5 rounded-full">
                STATION 03 // PROOF OVERVIEW
              </span>
              <h1 className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] uppercase tracking-tight leading-none">
                Suite Package <span className="italic font-light lowercase text-[#D27D5B]">summary</span>
              </h1>
              <p className="text-xs font-sans text-[#1F2B1A]/70 uppercase tracking-widest leading-[2.2] font-semibold">
                Your custom creations are fully compiled. Review the completed package layouts below. Click any card to edit its specific visual directives.
              </p>
            </div>

            {/* Grid of customized items */}
            <div className="space-y-4 pt-2">
              <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono font-bold block">
                COMPOSITE COMPONENT DIRECTS:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundle.items.map((item, idx) => {
                  const itemConfig = individualConfigs[item.productId];
                  const previewImg = itemConfig?.previewUrl || item.productImage;
                  return (
                    <div 
                      key={item.productId} 
                      className="flex flex-col justify-between bg-[#F5F1E6]/40 border border-[#8F9C86]/15 p-4 rounded-2xl relative shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex gap-4 items-center mb-4">
                        <div className="w-14 h-16 bg-white/40 border border-[#8F9C86]/10 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={previewImg} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply opacity-85" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-[#1F2B1A] uppercase truncate block tracking-wider text-xs">{item.productName}</span>
                          <span className="text-[9px] text-[#1F2B1A]/50 block mt-0.5">{item.sku} &bull; {item.quantity} unit(s)</span>
                          <span className="inline-block mt-1 text-[8px] uppercase tracking-widest text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full">Approved</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCustomizationMode('INDIVIDUAL');
                          setActiveIndex(idx);
                        }}
                        className="w-full py-2 bg-transparent hover:bg-[#1F2B1A] text-[#1F2B1A] hover:text-[#FAF6EE] border border-[#1F2B1A]/20 hover:border-transparent text-[9px] uppercase tracking-widest font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Edit Item Design
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gift Card Message Insert Details */}
            {Object.values(individualConfigs).some(c => c.giftMessage) && (
              <div className="border border-[#8F9C86]/20 bg-[#F5F1E6]/25 p-6 rounded-2xl space-y-2">
                <span className="text-[9px] uppercase tracking-widest text-[#D27D5B] font-bold block">// Packaging Insert Note:</span>
                <p className="text-xs font-sans text-[#1F2B1A]/80 leading-relaxed italic">
                  "{Object.values(individualConfigs).find(c => c.giftMessage)?.giftMessage}"
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: Cohesive Flat-Lay Render Preview */}
          <div className="w-full lg:w-[55%] bg-[#1F2B1A] relative flex flex-col justify-center items-center p-6 lg:p-16 rounded-[2.5rem] overflow-hidden min-h-[500px]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(210,125,91,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(210,125,91,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

            <div className="relative w-full max-w-2xl aspect-square border border-[#8F9C86]/15 bg-[#FAF6EE] p-6 lg:p-12 rounded-[2rem] shadow-2xl flex flex-col">
              {isGeneratingSummary ? (
                <div className="w-full h-full border border-[#1F2B1A]/5 rounded-[1.5rem] flex flex-col items-center justify-center relative bg-[#F5F1E6]/40">
                  <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
                    <span className="font-serif italic text-[11rem] text-[#1F2B1A] animate-pulse">flat-lay.</span>
                  </div>
                  <div className="text-center z-10 space-y-4 px-6">
                    <RefreshCw className="w-8 h-8 text-[#D27D5B] animate-spin mx-auto mb-2" />
                    <div className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A]">
                      Rendering Package Suite Flat-lay...
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/60 max-w-xs mx-auto leading-relaxed">
                      Compiling your individual approved item layouts into a unified physical presentation proof.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col relative group rounded-[1.5rem] overflow-hidden">
                  <img
                    src={summaryPreviewUrl || 'https://images.unsplash.com/photo-1607344645866-eea33a4e2e27?q=80&w=1200&auto=format&fit=crop'}
                    alt="Package flat-lay"
                    className="w-full h-full object-cover transition-all duration-[2s] ease-out filter sepia-[0.03]"
                  />
                  
                  {/* Summary interpretation log */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#FAF6EE] border-t border-[#8F9C86]/10 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
                    <div className="flex items-center gap-4">
                      <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-pulse"></span>
                      <div>
                        <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 block mb-1">Unified Flat-Lay Logs</span>
                        <span className="text-xs uppercase tracking-widest text-[#1F2B1A] leading-snug block font-bold">
                          {summaryInterpretation || `Applied consistent cohesive layout across items in ${bundle.name}.`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {summaryGenerated && (
              <div className="mt-12 flex w-full max-w-2xl gap-4 relative z-10">
                <button 
                  onClick={generateSummaryFlatlay}
                  className="flex-1 py-4.5 border border-[#FAF6EE]/20 text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate Flat-Lay
                </button>
                <button 
                  onClick={handleApprove}
                  className="flex-1 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isFromVault ? "Save Design & Exit to Vault" : "Approve & Proceed to Gifting"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // RENDER: Main Customizer Canvas (ALL and INDIVIDUAL modes)
  return (
    <div className="w-full flex flex-col min-h-screen animate-bloom bg-transparent">
      
      {/* Top Header navbar */}
      <div className="w-full border-b border-[#8F9C86]/10 flex justify-between items-center p-5 lg:px-12 bg-[#FAF6EE]">
        <button 
          onClick={() => {
            // Confirm exit dialog if prompt exists
            if (confirm("Are you sure you want to cancel the current design parameters?")) {
              setCustomizationMode('CHOOSE');
            }
          }}
          className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A] hover:text-[#D27D5B] transition-colors flex items-center gap-2 cursor-pointer"
        >
          &larr; Switch Customizer Mode
        </button>
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40">
          Studio Bundle Customizer / {bundle.name.toUpperCase()}
        </div>
      </div>

      {/* Item-level Progress Indicator Header (for INDIVIDUAL mode) */}
      {customizationMode === 'INDIVIDUAL' && (
        <div className="w-full bg-[#F5F1E6]/60 border-b border-[#8F9C86]/15 px-6 lg:px-12 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] bg-[#D27D5B]/10 px-3 py-1 rounded-full">
              Item {activeIndex + 1} of {bundle.items.length}
            </span>
            <span className="text-xs uppercase tracking-widest text-[#1F2B1A] font-bold font-mono">
              // Customizing: {activeItem.productName}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {bundle.items.map((item, idx) => {
              const isCurrent = idx === activeIndex;
              const isApproved = !!individualConfigs[item.productId]?.previewGenerated;

              return (
                <div key={item.productId} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => setActiveIndex(idx)}
                    className={`flex items-center gap-2.5 p-2 pr-4 rounded-full border transition-all cursor-pointer ${
                      isCurrent 
                        ? 'border-[#D27D5B] bg-[#FAF6EE] text-[#1F2B1A] shadow-inner font-bold' 
                        : isApproved
                          ? 'border-[#8F9C86]/40 bg-[#FAF6EE]/50 text-[#1F2B1A]/70'
                          : 'border-[#8F9C86]/15 bg-transparent text-[#1F2B1A]/40 hover:text-[#1F2B1A]'
                    }`}
                  >
                    <div className="w-6 h-7 bg-white/60 border border-[#8F9C86]/10 rounded overflow-hidden flex-shrink-0">
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider block truncate max-w-[110px]">
                      {item.productName}
                    </span>
                    {isApproved && (
                      <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" />
                    )}
                  </button>
                  {idx < bundle.items.length - 1 && (
                    <span className="mx-1 text-[#1F2B1A]/20 font-mono text-xs">&rarr;</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Layout Split */}
      <div className="flex flex-col lg:flex-row flex-grow w-full items-stretch">
        
        {/* Left Panel - Configuration & Form */}
        <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#8F9C86]/15 bg-[#FAF6EE]">
          
          {/* Bundle/Product Information */}
          <div className="p-8 lg:p-12 border-b border-[#8F9C86]/15 bg-[#F5F1E6]/20 space-y-6">
            <div className="flex justify-between items-start">
              <span className="inline-block text-xs uppercase tracking-[0.2em] text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-3.5 py-1.5 rounded-full">
                {customizationMode === 'ALL' ? 'Unified Customization' : `Item-by-Item / ${activeItem.sku}`}
              </span>
              <span className="font-serif text-3xl font-bold text-[#1F2B1A]">
                {customizationMode === 'ALL' ? `$${bundle.price.toFixed(2)}` : `$${activeItem.basePrice.toFixed(2)}`}
              </span>
            </div>
            
            <div>
              <h1 className="font-serif text-3xl lg:text-4xl text-[#1F2B1A] uppercase tracking-tight leading-none mb-2">
                {customizationMode === 'ALL' ? bundle.name : activeItem.productName}
              </h1>
              <p className="text-xs font-sans text-[#1F2B1A]/60 leading-[2.2] uppercase tracking-widest font-semibold">
                {customizationMode === 'ALL' ? 'Apply uniform aesthetic directives cohesive across items.' : activeItem.description}
              </p>
            </div>

            {/* List of other components inside the package */}
            {customizationMode === 'ALL' && (
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
            )}

            {/* Copy From Previous Item Button (INDIVIDUAL mode only, indices > 0) */}
            {customizationMode === 'INDIVIDUAL' && activeIndex > 0 && (
              <button
                type="button"
                onClick={handleCopyFromPrevious}
                className="w-full py-3 bg-transparent hover:bg-[#1F2B1A]/5 border border-[#1F2B1A]/20 hover:border-[#1F2B1A] text-[#1F2B1A] text-xs tracking-[0.2em] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Configuration From Previous Item
              </button>
            )}
          </div>

          {/* Canvas Customizer Inputs */}
          <div className="p-8 lg:p-12 flex-grow flex flex-col gap-8 bg-[#FAF6EE]">
            
            {/* Step 1: Intent Prompt (Natural language description) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">// Step 01 — Describe Your Vision</label>
                <button 
                  onClick={handleInspireMe}
                  className="text-xs uppercase tracking-[0.2em] font-bold text-[#D27D5B] hover:text-[#1F2B1A] transition-colors cursor-pointer"
                >
                  ✨ Inspire Me
                </button>
              </div>

              <div className="relative border border-[#8F9C86]/25 rounded-2xl bg-[#F5F1E6]/30 overflow-hidden focus-within:border-[#D27D5B]/70 transition-colors">
                <textarea
                  className="w-full h-32 pt-4 px-4 pb-3 bg-transparent text-xs font-sans uppercase tracking-widest leading-[2] text-[#1F2B1A] focus:outline-none resize-none placeholder:text-[#1F2B1A]/30"
                  placeholder="Tell us what you have in mind. E.g., 'I want our logo large and centered on the front in white with a gold tagline below it. Holiday feel.'"
                  value={prompt}
                  maxLength={500}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    if (customizationMode === 'INDIVIDUAL') {
                      updateActiveConfig('prompt', e.target.value);
                    }
                  }}
                />
                <div className="border-t border-[#8F9C86]/15 flex justify-between items-center px-4 py-2.5 bg-[#F5F1E6]/40">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-[#1F2B1A]/50">
                    Natural Creative Brief
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40">
                    {prompt.length}/500
                  </span>
                </div>
              </div>

              {/* Clarity Score Banner (Section 2.2 - Step 1) */}
              <div className={`border p-4 rounded-xl flex items-start gap-3 transition-colors ${clarity.color}`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold block">
                    Prompt Clarity: {clarity.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider block font-sans opacity-80 leading-normal">
                    {clarity.tip}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Logo Asset (Section 2.2 - Step 2) */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">// Step 02 — Upload Brand Logo</label>
              
              {logoUrl ? (
                <div className="border border-[#8F9C86]/25 rounded-2xl p-4 bg-[#F5F1E6]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={logoUrl} alt="uploaded logo" className="w-12 h-12 object-contain bg-white/40 border border-[#8F9C86]/10 p-1.5 rounded-lg grayscale" />
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-[#1F2B1A] block">Brand Asset Loaded</span>
                      <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 block font-mono">Status: Analyzed by Vision AI</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveLogo}
                    className="p-2 border border-red-500/20 hover:border-red-500 hover:bg-red-500/5 text-red-700 hover:text-red-600 rounded-full transition-colors cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label 
                  htmlFor="bundle-logo-upload-v3"
                  className="border border-dashed border-[#8F9C86]/40 rounded-2xl bg-[#FAF9F5]/40 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] flex flex-col justify-center items-center p-8 cursor-pointer transition-all duration-500 text-center shadow-sm group"
                >
                  <input 
                    type="file" 
                    id="bundle-logo-upload-v3" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload} 
                  />
                  <Package className="w-5 h-5 mb-2 opacity-50 group-hover:text-[#FAF6EE] group-hover:scale-110 transition-all" />
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A] group-hover:text-[#FAF6EE] mb-1">Drag or Browse Logo</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/50 group-hover:text-[#FAF6EE]/70 font-bold">Transparent PNG / SVG Recommended (Max 10MB)</span>
                </label>
              )}
            </div>

            {/* Step 3: Text Lines (Section 2.2 - Step 3) */}
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">// Step 03 — Printed Lettering</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative border-b border-[#8F9C86]/20 pb-1.5 focus-within:border-[#D27D5B]">
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Main text (printed on product)</label>
                  <input
                    type="text"
                    maxLength={40}
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="MAIN INSCRIPTION (MAX 40)"
                    value={textLine1}
                    onChange={(e) => {
                      setTextLine1(e.target.value);
                      if (customizationMode === 'INDIVIDUAL') {
                        updateActiveConfig('textLine1', e.target.value);
                      }
                    }}
                  />
                </div>
                <div className="relative border-b border-[#8F9C86]/20 pb-1.5 focus-within:border-[#D27D5B]">
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Supporting text (optional)</label>
                  <input
                    type="text"
                    maxLength={60}
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="SECONDARY CAPTION (MAX 60)"
                    value={textLine2}
                    onChange={(e) => {
                      setTextLine2(e.target.value);
                      if (customizationMode === 'INDIVIDUAL') {
                        updateActiveConfig('textLine2', e.target.value);
                      }
                    }}
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
                  onChange={(e) => {
                    setGiftMessage(e.target.value);
                    if (customizationMode === 'INDIVIDUAL') {
                      updateActiveConfig('giftMessage', e.target.value);
                    }
                  }}
                />
                <div className="border-t border-[#8F9C86]/15 flex justify-between items-center px-4 py-2 bg-[#F5F1E6]/40 text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold">
                  <span>This insert note will not be printed on items.</span>
                  <span>{giftMessage.length}/200</span>
                </div>
              </div>
            </div>

            {/* Step 5: Advanced Options Panel (Section 2.2 - Step 5) */}
            <div className="border-t border-[#8F9C86]/15 pt-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
              >
                {showAdvanced ? '▼ Hide Advanced Options' : '▶ Show Advanced Options'}
              </button>
              
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-in pb-2 text-xs">
                  <div className="relative border-b border-[#8F9C86]/20 pb-1.5">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Logo Placement Hint</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                      value={placementHint}
                      onChange={(e) => {
                        setPlacementHint(e.target.value);
                        if (customizationMode === 'INDIVIDUAL') {
                          updateActiveConfig('placementHint', e.target.value);
                        }
                      }}
                    >
                      <option value="Center">Front Large Center</option>
                      <option value="Left Chest">Left Chest Corner</option>
                      <option value="Right Chest">Right Chest Corner</option>
                      <option value="Sleeve">Sleeve / Edge Wrap</option>
                      <option value="Back">Large Symmetrical Back</option>
                    </select>
                  </div>

                  <div className="relative border-b border-[#8F9C86]/20 pb-1.5">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Text Color Preference</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        if (customizationMode === 'INDIVIDUAL') {
                          updateActiveConfig('textColor', e.target.value);
                        }
                      }}
                    >
                      <option value="Auto">Auto (Contrast-Optimized)</option>
                      <option value="Gold">Metallic Gold</option>
                      <option value="Silver">Metallic Silver</option>
                      <option value="White">Matte White</option>
                      <option value="Black">Matte Black</option>
                      <option value="Terracotta">Terracotta</option>
                    </select>
                  </div>

                  <div className="relative border-b border-[#8F9C86]/20 pb-1.5">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Typography Font Hint</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                      value={fontStyleHint}
                      onChange={(e) => {
                        setFontStyleHint(e.target.value);
                        if (customizationMode === 'INDIVIDUAL') {
                          updateActiveConfig('fontStyleHint', e.target.value);
                        }
                      }}
                    >
                      <option value="Auto">Auto-Select Matching</option>
                      <option value="Serif">Serif (Classic & Bold)</option>
                      <option value="Sans-serif">Sans-serif (Modern Clean)</option>
                      <option value="Script">Script (Elegant Cursive)</option>
                      <option value="Bold Display">Strong Impact Editorial</option>
                    </select>
                  </div>

                  {/* Background Treatment Controls (PRD Step 5) */}
                  <div className="relative border-b border-[#8F9C86]/20 pb-1.5">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Background Treatment</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer text-ellipsis overflow-hidden"
                      value={backgroundTreatment}
                      onChange={(e) => {
                        setBackgroundTreatment(e.target.value);
                        if (customizationMode === 'INDIVIDUAL') {
                          updateActiveConfig('backgroundTreatment', e.target.value);
                        }
                      }}
                    >
                      <option value="No Change">No Change (Keep Original)</option>
                      <option value="Subtle Pattern">Subtle AI Brand Texture</option>
                      <option value="Solid Color Fill">Solid Color Fill</option>
                    </select>
                  </div>

                  {backgroundTreatment === 'Solid Color Fill' && (
                    <div className="md:col-span-2 relative border-b border-[#8F9C86]/20 pb-1.5 animate-fade-in flex items-center gap-4">
                      <div className="flex-grow">
                        <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Background Solid Hex</label>
                        <input
                          type="text"
                          className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                          placeholder="#FAF6EE"
                          value={customBackgroundHex}
                          onChange={(e) => {
                            setCustomBackgroundHex(e.target.value);
                            if (customizationMode === 'INDIVIDUAL') {
                              updateActiveConfig('customBackgroundHex', e.target.value);
                            }
                          }}
                        />
                      </div>
                      <input 
                        type="color" 
                        className="w-8 h-8 rounded-full border border-[#8F9C86]/20 cursor-pointer overflow-hidden p-0"
                        value={customBackgroundHex.startsWith('#') && customBackgroundHex.length === 7 ? customBackgroundHex : '#FAF6EE'}
                        onChange={(e) => {
                          setCustomBackgroundHex(e.target.value);
                          if (customizationMode === 'INDIVIDUAL') {
                            updateActiveConfig('customBackgroundHex', e.target.value);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 6: Generate Preview Action */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
            >
              {isGenerating 
                ? customizationMode === 'ALL' 
                  ? 'Rendering Harmonized Suite Previews...' 
                  : `Rendering Custom ${activeItem.productName}...`
                : customizationMode === 'ALL'
                  ? 'Execute Harmonized Rendering'
                  : 'Execute Item Rendering'
              }
            </button>
            
          </div>
        </div>

        {/* Right Panel - Live Proof Viewport */}
        <div className="w-full lg:w-[55%] bg-[#1F2B1A] relative flex flex-col justify-center items-center p-6 lg:p-16 overflow-hidden min-h-[500px]">
          
          {/* Grid backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(210,125,91,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(210,125,91,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          <div className="relative w-full max-w-2xl aspect-square border border-[#8F9C86]/15 bg-[#FAF6EE] p-6 lg:p-12 rounded-[2rem] shadow-2xl flex flex-col justify-between">
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
                      {customizationMode === 'ALL' 
                        ? 'Provide parameters on the left to render your branded unboxing box arrangement.' 
                        : `Provide parameters to render a custom visualization of your ${activeItem.productName}.`
                      }
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
                
                {/* Interpretation Summary overlay (Section 2.2 - Step 6) */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#FAF6EE] border-t border-[#8F9C86]/10 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-4">
                     <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-pulse"></span>
                     <div>
                       <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 block mb-1">AI Interpretation Summary</span>
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
              <button 
                onClick={handleGenerate}
                className="flex-1 py-4.5 border border-[#FAF6EE]/20 text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate Variation
              </button>
              <button 
                onClick={customizationMode === 'ALL' ? handleApprove : handleApproveItem}
                className="flex-1 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {customizationMode === 'ALL' ? (
                  isFromVault ? <>Save Design & Exit to Vault <ArrowRight className="w-4 h-4" /></> : <>Approve & Proceed to Checkout <ArrowRight className="w-4 h-4" /></>
                ) : activeIndex < bundle.items.length - 1 ? (
                  <>Approve & Next Item <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>Approve & View Package Proof <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}
