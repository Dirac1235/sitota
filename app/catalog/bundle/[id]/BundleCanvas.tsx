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
  AlertCircle,
  Plus,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  X
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
  isCustomizable?: boolean;
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
  status: 'pending' | 'generating' | 'ready' | 'approved';
  error?: string;
}

export default function BundleCanvas({ 
  bundle, 
  allProducts = [] 
}: { 
  bundle: Bundle;
  allProducts?: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  // Customization Stage State: CHOOSE (selection screen), ALL (apply-to-all), INDIVIDUAL (item-by-item), SUMMARY (flat-lay overview)
  const [customizationMode, setCustomizationMode] = useState<'CHOOSE' | 'ALL' | 'INDIVIDUAL' | 'SUMMARY'>('CHOOSE');

  // Dynamic Bundle Items State (so products can be appended at runtime)
  const [bundleItems, setBundleItems] = useState<BundleProduct[]>(bundle.items);

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

  // Item-by-Item States & Configurations Mapping
  const [activeIndex, setActiveIndex] = useState(0);
  const [individualConfigs, setIndividualConfigs] = useState<Record<string, ItemConfig>>({});

  // Summary Flat-Lay States
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryPreviewUrl, setSummaryPreviewUrl] = useState('');
  const [summaryDesignId, setSummaryDesignId] = useState('');
  const [summaryInterpretation, setSummaryInterpretation] = useState('');
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [showFlatLayToggle, setShowFlatLayToggle] = useState(false); // Default is false (Individual Previews Grid shown first)

  // Catalog Side Panel State
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCat, setCatalogCat] = useState('All');

  // Prompt Apply-to-All Action state
  const [showApplyToAllPrompt, setShowApplyToAllPrompt] = useState<{ isOpen: boolean; product: any } | null>(null);

  // Carousel Index state (For the CHOOSE state bundle detail view carousel)
  const [carouselIndex, setCarouselIndex] = useState(0);

  const activeItem = bundleItems[activeIndex];

  // Initialize individual configs for products
  useEffect(() => {
    if (bundleItems && Object.keys(individualConfigs).length === 0) {
      const initialConfigs: Record<string, ItemConfig> = {};
      bundleItems.forEach(item => {
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
          isGenerating: false,
          status: item.isCustomizable === false ? 'approved' : 'pending'
        };
      });
      setIndividualConfigs(initialConfigs);
    }
  }, [bundleItems]);

  // Sync state values when active item or individual configs change
  useEffect(() => {
    if (activeItem) {
      const config = individualConfigs[activeItem.productId];
      if (config) {
        // Sync preview-specific outputs for both modes so they show in the main canvas
        setPreviewUrl(config.previewUrl);
        setInterpretation(config.interpretation);
        setDesignId(config.designId);
        setPreviewGenerated(config.previewGenerated);

        // Only sync input fields in INDIVIDUAL mode
        if (customizationMode === 'INDIVIDUAL') {
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
        }
      }
    }
  }, [activeIndex, customizationMode, individualConfigs, activeItem]);

  // Helper to dynamically update the active product's configuration mapping
  const updateActiveConfig = (field: keyof ItemConfig, value: any) => {
    if (customizationMode === 'INDIVIDUAL' && activeItem) {
      setIndividualConfigs(prev => ({
        ...prev,
        [activeItem.productId]: {
          ...prev[activeItem.productId],
          [field]: value
        }
      }));
    }
  };

  // Helper to detect if form inputs differ from the last generated preview
  const hasInputsChanged = (productId: string) => {
    const config = individualConfigs[productId];
    if (!config || !config.previewGenerated) return false;
    return (
      prompt !== config.prompt ||
      logoUrl !== config.logoUrl ||
      textLine1 !== config.textLine1 ||
      textLine2 !== config.textLine2 ||
      giftMessage !== config.giftMessage ||
      placementHint !== config.placementHint ||
      textColor !== config.textColor ||
      fontStyleHint !== config.fontStyleHint ||
      backgroundTreatment !== config.backgroundTreatment ||
      (backgroundTreatment === 'Solid Color Fill' && customBackgroundHex !== config.customBackgroundHex)
    );
  };

  // Helper for computing Clarity Score
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

  // Copy values from the previous item in the bundle sequence
  const handleCopyFromPrevious = () => {
    if (activeIndex === 0) return;
    const prevProd = bundleItems[activeIndex - 1];
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
          previewGenerated: false,
          status: 'pending'
        }
      }));
    }
  };

  // Execute AI generation for unified 'ALL' mode or single item in 'INDIVIDUAL' mode
  const handleGenerate = async () => {
    if (customizationMode === 'ALL') {
      await handleGenerateAll();
      return;
    }

    setIsGenerating(true);
    setIndividualConfigs(prev => ({
      ...prev,
      [activeItem.productId]: {
        ...prev[activeItem.productId],
        isGenerating: true,
        status: 'generating',
        error: undefined
      }
    }));

    try {
      const requestPayload: any = {
        productId: activeItem.productId,
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
            isGenerating: false,
            status: 'ready',
            error: undefined
          }
        }));
      } else {
        throw new Error(data.error || 'Failed to construct premium preview.');
      }
    } catch (err: any) {
      console.error(err);
      setIndividualConfigs(prev => ({
        ...prev,
        [activeItem.productId]: {
          ...prev[activeItem.productId],
          isGenerating: false,
          status: 'pending',
          error: err.message || 'Customizer engine error. Please retry.'
        }
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  // Loop through and generate individual preview images for each product in ALL mode
  const handleGenerateAll = async () => {
    setIsGenerating(true);
    const updatedConfigs = { ...individualConfigs };
    const customizableItems = bundleItems.filter(item => item.isCustomizable !== false);
    
    customizableItems.forEach(item => {
      updatedConfigs[item.productId] = {
        ...updatedConfigs[item.productId],
        isGenerating: true,
        status: 'generating',
        error: undefined
      };
    });
    setIndividualConfigs(updatedConfigs);

    const promises = customizableItems.map(async (item) => {
      try {
        const res = await fetch('/api/generate-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
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
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setIndividualConfigs(prev => ({
            ...prev,
            [item.productId]: {
              ...prev[item.productId],
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
              isGenerating: false,
              status: 'ready',
              error: undefined
            }
          }));
        } else {
          throw new Error(data.error || 'Failed rendering product.');
        }
      } catch (err: any) {
        console.error(`Generation failed for ${item.productName}:`, err);
        setIndividualConfigs(prev => ({
          ...prev,
          [item.productId]: {
            ...prev[item.productId],
            isGenerating: false,
            status: 'pending',
            error: err.message || 'Generation failed. Retry.'
          }
        }));
      }
    });

    await Promise.all(promises);
    setIsGenerating(false);
    setPreviewGenerated(true);
  };

  // Progress item sequence / transition to Summary Overview
  const handleApproveItem = () => {
    setIndividualConfigs(prev => ({
      ...prev,
      [activeItem.productId]: {
        ...prev[activeItem.productId],
        status: 'approved'
      }
    }));

    if (activeIndex < bundleItems.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else {
      // Check if all items are approved
      const pendingItems = bundleItems.filter(
        item => item.isCustomizable !== false && individualConfigs[item.productId]?.status !== 'approved' && item.productId !== activeItem.productId
      );
      if (pendingItems.length > 0) {
        alert("Some added items are still pending customization. Please customize all elements.");
        const firstPendingIdx = bundleItems.findIndex(i => i.productId === pendingItems[0].productId);
        if (firstPendingIdx !== -1) {
          setActiveIndex(firstPendingIdx);
        }
      } else {
        setCustomizationMode('SUMMARY');
      }
    }
  };

  // Approve all items simultaneously in ALL mode
  const handleApproveAll = () => {
    setIndividualConfigs(prev => {
      const updated = { ...prev };
      bundleItems.forEach(item => {
        if (item.isCustomizable !== false && updated[item.productId]) {
          updated[item.productId] = {
            ...updated[item.productId],
            status: 'approved'
          };
        }
      });
      return updated;
    });
    setCustomizationMode('SUMMARY');
  };

  // Generate full Package Flat-Lay summary (Cohesive group shot)
  const generateSummaryFlatlay = async () => {
    setIsGeneratingSummary(true);
    
    const firstConfig = Object.values(individualConfigs)[0];
    const itemNamesList = bundleItems.map(item => `${item.quantity}x ${item.productName}`).join(', ');
    const firstPromptText = firstConfig?.prompt || 'A cohesive, luxury corporate-aligned gift suite';

    const visualBrief = `An elegant unboxed flat-lay arrangement of the '${bundle.name}' welcome box suite containing: ${itemNamesList}. Layout directive: "${firstPromptText}"`;
    const serializedData = JSON.stringify({
      isCohesive: false,
      items: Object.entries(individualConfigs).reduce((acc, [productId, cfg]) => {
        acc[productId] = {
          designId: cfg.designId,
          previewUrl: cfg.previewUrl,
          prompt: cfg.prompt,
          textLine1: cfg.textLine1,
          textLine2: cfg.textLine2,
          placementHint: cfg.placementHint,
          textColor: cfg.textColor,
          fontStyleHint: cfg.fontStyleHint,
          backgroundTreatment: cfg.backgroundTreatment,
          customBackgroundHex: cfg.customBackgroundHex
        };
        return acc;
      }, {} as Record<string, any>)
    });

    const compositePromptWithMetadata = `${visualBrief} |||JSON||| ${serializedData}`;

    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: bundle.id,
          intentPrompt: compositePromptWithMetadata,
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

  // Handle addition of products from the catalog side panel
  const handleAddProductToBundle = (product: any) => {
    const isAlreadyIn = bundleItems.some(item => item.productId === product.id);
    if (isAlreadyIn) {
      alert(`${product.name} is already in the bundle.`);
      return;
    }

    const newBundleItem: BundleProduct = {
      id: `new-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600',
      quantity: 1,
      basePrice: product.basePrice,
      category: product.category,
      sku: product.sku,
      description: product.description,
      isCustomizable: product.isCustomizable
    };

    // Append to local state list
    setBundleItems(prev => [...prev, newBundleItem]);

    // Initialize individual configuration
    setIndividualConfigs(prev => ({
      ...prev,
      [product.id]: {
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
        isGenerating: false,
        status: product.isCustomizable === false ? 'approved' : 'pending'
      }
    }));

    setIsCatalogOpen(false);

    // Ask Apply-to-all prompt if in ALL mode
    if (customizationMode === 'ALL' && product.isCustomizable !== false) {
      setShowApplyToAllPrompt({ isOpen: true, product: newBundleItem });
    } else {
      alert(`Appended ${product.name} with pending status. Please design and approve it to finalize your bundle.`);
    }
  };

  const handleConfirmApplyToAll = async (apply: boolean) => {
    if (!showApplyToAllPrompt) return;
    const prod = showApplyToAllPrompt.product;

    if (apply) {
      // 1. Mark as generating first
      setIndividualConfigs(prev => ({
        ...prev,
        [prod.productId]: {
          ...prev[prod.productId],
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
          isGenerating: true,
          status: 'generating',
          error: undefined
        }
      }));

      // Switch active index to the newly added item immediately so the user sees the spinner
      const newIdx = bundleItems.findIndex(item => item.productId === prod.productId);
      if (newIdx !== -1) {
        setActiveIndex(newIdx);
      }

      setShowApplyToAllPrompt(null);

      // 2. Perform the generation automatically
      try {
        const res = await fetch('/api/generate-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: prod.productId,
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
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setIndividualConfigs(prev => ({
            ...prev,
            [prod.productId]: {
              ...prev[prod.productId],
              previewUrl: data.previewUrl,
              interpretation: data.interpretation,
              designId: data.designId,
              previewGenerated: true,
              isGenerating: false,
              status: 'ready',
              error: undefined
            }
          }));
        } else {
          throw new Error(data.error || 'Failed rendering product.');
        }
      } catch (err: any) {
        console.error(`Auto-generation failed for added item ${prod.productName}:`, err);
        setIndividualConfigs(prev => ({
          ...prev,
          [prod.productId]: {
            ...prev[prod.productId],
            isGenerating: false,
            status: 'pending',
            error: err.message || 'Generation failed'
          }
        }));
      }
    } else {
      setShowApplyToAllPrompt(null);
    }
  };

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

  // Filter products for catalog side panel search
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = catalogCat === 'All' || p.category === catalogCat;
    return matchesSearch && matchesCat;
  });

  // Carousel item for rendering in CHOOSE mode
  const currentCarouselItem = bundleItems[carouselIndex];
  const carouselConfig = currentCarouselItem ? individualConfigs[currentCarouselItem.productId] : null;

  // Render: Mode Selection / Bundle Detail Page (CHOOSE stage)
  if (customizationMode === 'CHOOSE') {
    return (
      <div className="w-full min-h-screen bg-[#FAF6EE] py-12 px-6 lg:px-12 font-sans relative">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#8F9C86]/15 pb-8">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#D27D5B] rounded-full animate-pulse"></span>
                BUNDLE PREVIEW CHOP
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
                {bundle.name}
              </h1>
              <p className="text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/70 max-w-lg leading-relaxed">
                Configure your bundle's items individually or harmonized. Browse item cards below. You can append more products to your package using the catalog panel.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCatalogOpen(true)}
                className="px-6 py-3.5 bg-white border border-[#8F9C86]/30 hover:border-[#D27D5B] text-[#1F2B1A] hover:text-[#D27D5B] text-xs uppercase tracking-[0.2em] font-bold rounded-full transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D27D5B]" /> Add Products
              </button>
              
              <Link href="/catalog/bundles" className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors">
                &larr; Exit
              </Link>
            </div>
          </div>

          {/* Core Content: Row of Previews & Main Immersive Carousel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Column: Carousel (Immersive single view) */}
            <div className="lg:col-span-7 bg-[#1F2B1A] p-6 lg:p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(210,125,91,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(210,125,91,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
              
              <div className="relative z-10 flex justify-between items-center w-full text-[#FAF6EE]/60 text-[10px] uppercase tracking-widest font-mono font-bold">
                <span>Immersive Suite Carousel</span>
                <span>Item {carouselIndex + 1} of {bundleItems.length}</span>
              </div>

              {currentCarouselItem && (
                <div className="relative z-10 my-8 flex flex-col items-center max-w-md mx-auto aspect-square w-full justify-center">
                  <div className="bg-[#FAF6EE] p-6 rounded-[2rem] border border-[#8F9C86]/15 shadow-2xl relative w-full h-full flex flex-col justify-between group overflow-hidden">
                    <img 
                      src={carouselConfig?.previewUrl || currentCarouselItem.productImage} 
                      alt={currentCarouselItem.productName} 
                      className="w-full h-full object-cover rounded-xl mix-blend-multiply opacity-95 group-hover:opacity-100 transition-all filter sepia-[0.03]"
                    />
                    
                    {/* Status Dot / Indicator Overlays */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 text-[8px] uppercase tracking-widest font-extrabold rounded-full ${
                        currentCarouselItem.isCustomizable === false 
                          ? 'bg-gray-100 text-gray-700 border border-gray-300' 
                          : carouselConfig?.status === 'approved' 
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : carouselConfig?.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      }`}>
                        {currentCarouselItem.isCustomizable === false ? 'Included As-Is' : carouselConfig?.status || 'Pending Design'}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-[#FAF6EE] border-t border-[#8F9C86]/10 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 text-left">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#1F2B1A]/40 block font-bold">Customization Applied</span>
                      <p className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A] mt-1 leading-normal">
                        {currentCarouselItem.isCustomizable === false 
                          ? "This culinary item is packaged and included as-is." 
                          : carouselConfig?.interpretation || "Awaiting branding parameters. Ready for your customization direction."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide controls */}
              <div className="relative z-10 flex justify-between items-center">
                <button
                  onClick={() => setCarouselIndex(prev => (prev === 0 ? bundleItems.length - 1 : prev - 1))}
                  className="w-12 h-12 rounded-full border border-white/20 text-white hover:bg-white hover:text-[#1F2B1A] flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/50 font-mono">
                  {currentCarouselItem?.productName.toUpperCase()}
                </span>

                <button
                  onClick={() => setCarouselIndex(prev => (prev === bundleItems.length - 1 ? 0 : prev + 1))}
                  className="w-12 h-12 rounded-full border border-white/20 text-white hover:bg-white hover:text-[#1F2B1A] flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Right Column: Mode Choose & Design Buttons */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <span className="text-xs uppercase tracking-widest font-extrabold text-[#D27D5B] block">// Select Design Workspace Mode</span>
                <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-tight text-[#1F2B1A] leading-tight">
                  Design your custom gifting suite
                </h2>
                <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/70 leading-relaxed font-bold">
                  Select whether you want to branding-align all components in this package simultaneously (best for unified logos and themes) or detail each component independently.
                </p>
              </div>

              {/* Modes Cards Stack */}
              <div className="space-y-4">
                <button
                  onClick={() => setCustomizationMode('ALL')}
                  className="w-full p-6 bg-white hover:bg-[#FAF9F5] border border-[#8F9C86]/15 hover:border-[#D27D5B] rounded-[2rem] text-left transition-all group flex gap-5 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D27D5B]/10 text-[#D27D5B] flex items-center justify-center border border-[#D27D5B]/20 flex-shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-[#1F2B1A] group-hover:text-[#D27D5B] transition-colors uppercase tracking-tight">
                      Apply brand treatment to all items
                    </h4>
                    <p className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold mt-1">One layout description &bull; Individually generated previews</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCustomizationMode('INDIVIDUAL');
                    setActiveIndex(0);
                  }}
                  className="w-full p-6 bg-white hover:bg-[#FAF9F5] border border-[#8F9C86]/15 hover:border-[#D27D5B] rounded-[2rem] text-left transition-all group flex gap-5 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[#8F9C86]/20 text-[#1F2B1A] flex items-center justify-center border border-[#8F9C86]/10 flex-shrink-0">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-[#1F2B1A] group-hover:text-[#D27D5B] transition-colors uppercase tracking-tight">
                      Customize each item independently
                    </h4>
                    <p className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold mt-1">Bespoke per-item directives &bull; Tailored customization controls</p>
                  </div>
                </button>
              </div>

              {/* Mini Price Summary Card */}
              <div className="border border-[#8F9C86]/20 bg-[#F5F1E6]/40 p-6 rounded-[2rem] space-y-4">
                <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold">
                  <span className="text-[#1F2B1A]/60">Package Price ({bundleItems.length} items)</span>
                  <span className="font-serif text-xl text-[#1F2B1A]">${bundle.price.toFixed(2)}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Scrollable Previews Row */}
          <div className="space-y-6 pt-6 border-t border-[#8F9C86]/15">
            <h3 className="text-xs uppercase tracking-[0.3em] font-extrabold text-[#1F2B1A]/40 font-mono flex items-center gap-2">
              <Clipboard className="w-4 h-4" /> Assembled Package Component Row
            </h3>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin max-w-full">
              {bundleItems.map((item, idx) => {
                const config = individualConfigs[item.productId];
                const previewImg = config?.previewUrl || item.productImage;
                const isCustomizable = item.isCustomizable !== false;

                return (
                  <div 
                    key={item.productId}
                    className="flex-shrink-0 w-64 bg-white/40 border border-[#8F9C86]/12 rounded-3xl p-4 flex flex-col justify-between relative hover:border-[#D27D5B] transition-all group"
                  >
                    <div className="space-y-4">
                      {/* Image Frame */}
                      <div className="relative aspect-square bg-[#FAF9F5] border border-[#8F9C86]/10 rounded-2xl overflow-hidden">
                        <img src={previewImg} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply opacity-85 group-hover:opacity-100 transition-all" />
                        
                        {!isCustomizable && (
                          <div className="absolute top-2 left-2 bg-[#1F2B1A] text-[#FAF6EE] px-2.5 py-1 rounded-full text-[8px] uppercase tracking-widest font-bold font-sans">
                            Included As-is
                          </div>
                        )}
                        
                        {isCustomizable && (
                          <div className="absolute top-2 left-2">
                            <span className={`px-2.5 py-1 text-[8px] uppercase tracking-widest font-bold rounded-full border ${
                              config?.status === 'approved'
                                ? 'bg-green-100 border-green-300 text-green-700'
                                : config?.status === 'ready'
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                  : 'bg-yellow-100 border-yellow-300 text-yellow-700'
                            }`}>
                              {config?.status || 'Pending'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[8px] font-mono font-bold uppercase text-[#1F2B1A]/40 block">{item.sku}</span>
                        <h4 className="font-serif text-sm uppercase tracking-tight text-[#1F2B1A] mt-1 truncate">{item.productName}</h4>
                        <p className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/60 font-medium leading-relaxed mt-2 line-clamp-2">
                          {!isCustomizable 
                            ? "This item cannot be customized." 
                            : config?.interpretation || "Design pending. Create layout configurations to preview."
                          }
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#8F9C86]/10 pt-3 mt-4 flex justify-between items-center">
                      <span className="text-[9px] font-bold font-mono text-[#1F2B1A]/60">Qty: {item.quantity}</span>
                      <button
                        onClick={() => {
                          setCarouselIndex(idx);
                        }}
                        className="text-[9px] font-bold uppercase tracking-widest text-[#D27D5B] hover:text-[#1F2B1A] bg-transparent border-0 cursor-pointer"
                      >
                        Focus Card
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Catalog Side Panel */}
        {renderCatalogPanel()}
      </div>
    );
  }

  // Render: Flat-Lay Package Summary Screen (final step when all approved)
  if (customizationMode === 'SUMMARY') {
    return (
      <div className="w-full flex flex-col min-h-screen bg-[#FAF6EE] animate-bloom">
        
        {/* Header */}
        <div className="w-full border-b border-[#8F9C86]/10 flex justify-between items-center p-5 lg:px-12">
          <button 
            onClick={() => {
              setCustomizationMode('INDIVIDUAL');
              setActiveIndex(bundleItems.length - 1);
            }}
            className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A] hover:text-[#D27D5B] transition-colors flex items-center gap-2 cursor-pointer"
          >
            &larr; Return to Workspace Canvas
          </button>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40">
            Suite Package Summary / {bundle.name.toUpperCase()}
          </div>
        </div>

        <div className="flex-grow w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col lg:flex-row gap-12 items-stretch">
          
          {/* Left Panel: List of all items & final summary specs */}
          <div className="w-full lg:w-[45%] flex flex-col justify-between space-y-8 bg-transparent">
            <div className="space-y-6">
              <span className="inline-block text-xs uppercase tracking-[0.2em] text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-3.5 py-1.5 rounded-full">
                APPROVED DESIGN PROOFS
              </span>
              <h1 className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] uppercase tracking-tight leading-none">
                Suite Package <span className="italic font-light lowercase text-[#D27D5B]">summary</span>
              </h1>
              <p className="text-xs font-sans text-[#1F2B1A]/70 uppercase tracking-widest leading-[2.2] font-semibold">
                Your custom creations are fully compiled. Below you can view the final individual approved designs or flip on the cohesive Flat-Lay arrangement.
              </p>
            </div>

            {/* Toggle Button for Flat-lay vs Previews Grid */}
            <div className="flex border border-[#8F9C86]/20 p-1.5 rounded-full bg-[#F5F1E6]/40 max-w-sm">
              <button
                onClick={() => setShowFlatLayToggle(false)}
                className={`flex-1 py-2.5 rounded-full text-[9px] uppercase tracking-widest font-extrabold transition-all cursor-pointer ${
                  !showFlatLayToggle ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow' : 'text-[#1F2B1A]/60'
                }`}
              >
                📄 Individual Previews Grid
              </button>
              <button
                onClick={() => setShowFlatLayToggle(true)}
                className={`flex-1 py-2.5 rounded-full text-[9px] uppercase tracking-widest font-extrabold transition-all cursor-pointer ${
                  showFlatLayToggle ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow' : 'text-[#1F2B1A]/60'
                }`}
              >
                ✨ Package Flat-Lay Proof
              </button>
            </div>

            {/* Grid list of approved package elements */}
            <div className="space-y-4 pt-2">
              <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono font-bold block">
                Assembled Package Elements ({bundleItems.length}):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
                {bundleItems.map((item, idx) => {
                  const itemConfig = individualConfigs[item.productId];
                  const previewImg = itemConfig?.previewUrl || item.productImage;
                  return (
                    <div 
                      key={item.productId} 
                      className="flex flex-col justify-between bg-[#F5F1E6]/40 border border-[#8F9C86]/15 p-4 rounded-2xl shadow-sm group"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-16 bg-white border border-[#8F9C86]/10 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={previewImg} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply opacity-85" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-[#1F2B1A] uppercase truncate block tracking-wider text-xs">{item.productName}</span>
                          <span className="text-[9px] text-[#1F2B1A]/50 block mt-0.5">{item.sku} &bull; {item.quantity} unit(s)</span>
                          <span className="inline-block mt-1 text-[8px] uppercase tracking-widest text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full">Approved</span>
                        </div>
                      </div>

                      {item.isCustomizable !== false && (
                        <button
                          onClick={() => {
                            setCustomizationMode('INDIVIDUAL');
                            setActiveIndex(idx);
                          }}
                          className="w-full mt-3 py-1.5 bg-transparent hover:bg-[#1F2B1A] text-[#1F2B1A] hover:text-[#FAF6EE] border border-[#1F2B1A]/20 hover:border-transparent text-[8px] uppercase tracking-widest font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Edit Item Design
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Panel: Conditional display (Individual Previews Grid OR Cohesive Flat-Lay) */}
          <div className="w-full lg:w-[55%] bg-[#1F2B1A] relative flex flex-col justify-center items-center p-6 lg:p-10 rounded-[2.5rem] overflow-hidden min-h-[550px]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(210,125,91,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(210,125,91,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

            {!showFlatLayToggle ? (
              /* GRID OF INDIVIDUAL PREVIEWS TOGETHER (Default final view) */
              <div className="relative z-10 w-full text-left space-y-6">
                <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#D27D5B] block font-mono">// Individual Approved Previews</span>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {bundleItems.map((item) => {
                    const cfg = individualConfigs[item.productId];
                    const img = cfg?.previewUrl || item.productImage;
                    return (
                      <div key={item.productId} className="bg-[#FAF6EE] border border-[#8F9C86]/25 rounded-2xl p-4 flex flex-col justify-between shadow-lg h-56">
                        <div className="relative flex-grow max-h-32 rounded-xl overflow-hidden bg-white border border-[#8F9C86]/10">
                          <img src={img} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                        </div>
                        <div className="mt-3">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1F2B1A] block truncate">{item.productName}</span>
                          <span className="text-[8px] uppercase tracking-widest text-[#D27D5B] font-bold mt-1 block">
                            {item.isCustomizable === false ? "Included As-Is" : cfg?.interpretation || "Custom layout approved"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* COHESIVE FLAT-LAY RENDER (Optional Toggle View only) */
              <div className="relative z-10 w-full max-w-xl aspect-square border border-[#8F9C86]/15 bg-[#FAF6EE] p-6 rounded-[2rem] shadow-2xl flex flex-col justify-between">
                {isGeneratingSummary ? (
                  <div className="w-full h-full border border-[#1F2B1A]/5 rounded-[1.5rem] flex flex-col items-center justify-center relative bg-[#F5F1E6]/40">
                    <RefreshCw className="w-8 h-8 text-[#D27D5B] animate-spin mb-4" />
                    <div className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A]">Rendering Composite Flat-lay...</div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col relative group rounded-[1.5rem] overflow-hidden">
                    <img
                      src={summaryPreviewUrl || 'https://images.unsplash.com/photo-1607344645866-eea33a4e2e27?q=80&w=1200&auto=format&fit=crop'}
                      alt="Package flat-lay"
                      className="w-full h-full object-cover filter sepia-[0.03]"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-[#FAF6EE] border-t border-[#8F9C86]/10 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
                      <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 block">Cohesive Composition Summary</span>
                      <span className="text-[10px] uppercase tracking-wider text-[#1F2B1A] leading-snug block font-bold mt-1">
                        {summaryInterpretation || `Flat-lay rendering of items in ${bundle.name}.`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Final Actions Block */}
            <div className="mt-8 flex w-full max-w-xl gap-4 relative z-10">
              {showFlatLayToggle && (
                <button 
                  onClick={generateSummaryFlatlay}
                  disabled={isGeneratingSummary}
                  className="flex-1 py-4 border border-[#FAF6EE]/20 text-[#FAF6EE] text-[10px] tracking-[0.2em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate Flat-Lay
                </button>
              )}
              <button 
                onClick={handleApprove}
                className="flex-grow py-4 bg-[#D27D5B] text-[#FAF6EE] text-[10px] tracking-[0.2em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isFromVault ? "Save Design & Exit to Vault" : "Approve & Proceed to Gifting"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Catalog Side Panel */}
        {renderCatalogPanel()}
      </div>
    );
  }

  // Render: Customization Canvas (ALL and INDIVIDUAL modes)
  const currentConfig = individualConfigs[activeItem?.productId];
  const itemIsCustomizable = activeItem?.isCustomizable !== false;

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FAF6EE] font-sans">
      
      {/* Top Header navbar */}
      <div className="w-full border-b border-[#8F9C86]/10 flex justify-between items-center p-5 lg:px-12">
        <button 
          onClick={() => {
            if (confirm("Switch customization modes? This will reset parameters back to selection stage.")) {
              setCustomizationMode('CHOOSE');
            }
          }}
          className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A] hover:text-[#D27D5B] transition-colors flex items-center gap-2 cursor-pointer"
        >
          &larr; Switch Customizer Mode
        </button>
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 font-mono">
          Studio Bundle Customizer / {bundle.name.toUpperCase()}
        </div>
      </div>

      {/* Horizontal thumbnail strip at the top with a + button */}
      <div className="w-full bg-[#F5F1E6]/40 border-b border-[#8F9C86]/15 px-6 lg:px-12 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D27D5B] bg-[#D27D5B]/10 px-3 py-1 rounded-full">
            {customizationMode === 'ALL' ? 'Apply to All' : `Item ${activeIndex + 1} of ${bundleItems.length}`}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/70 font-mono font-bold">
            // Active: {activeItem?.productName}
          </span>
        </div>

        {/* Thumbnail Progress Strip */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full">
          {bundleItems.map((item, idx) => {
            const isCurrent = idx === activeIndex;
            const config = individualConfigs[item.productId];
            const previewImg = config?.previewUrl || item.productImage;
            const isApproved = config?.status === 'approved';
            const isReady = config?.status === 'ready';
            const isGeneratingItem = config?.status === 'generating';
            const isCustomizable = item.isCustomizable !== false;
            
            // Color-coded status dots
            let statusDotColor = 'bg-yellow-500'; // pending
            if (!isCustomizable) statusDotColor = 'bg-gray-400';
            else if (isGeneratingItem) statusDotColor = 'bg-blue-500 animate-pulse';
            else if (isApproved) statusDotColor = 'bg-emerald-500';
            else if (isReady) statusDotColor = 'bg-green-500';

            return (
              <div key={item.productId} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => {
                    setActiveIndex(idx);
                  }}
                  className={`flex items-center gap-2 p-2 pr-3.5 rounded-full border transition-all cursor-pointer ${
                    isCurrent 
                      ? 'border-[#D27D5B] bg-white text-[#1F2B1A] font-bold shadow-sm' 
                      : 'border-[#8F9C86]/15 bg-transparent text-[#1F2B1A]/60 hover:text-[#1F2B1A]'
                  }`}
                  title={customizationMode === 'ALL' ? 'View individual product preview' : `Configure ${item.productName}`}
                >
                  <div className="w-7 h-8 bg-white/60 border border-[#8F9C86]/10 rounded overflow-hidden flex-shrink-0 relative">
                    <img src={previewImg} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${statusDotColor}`} />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider block truncate max-w-[90px]">
                    {item.productName}
                  </span>
                  {isApproved && (
                    <Check className="w-3.5 h-3.5 text-green-600 stroke-[3] ml-1" />
                  )}
                </button>
                {idx < bundleItems.length - 1 && (
                  <span className="mx-1 text-[#1F2B1A]/20 font-mono text-[9px]">&rarr;</span>
                )}
              </div>
            );
          })}

          {/* Plus button at the end of the strip */}
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="w-8 h-8 rounded-full border border-dashed border-[#8F9C86]/40 hover:border-[#D27D5B] text-[#1F2B1A]/50 hover:text-[#D27D5B] hover:bg-white flex items-center justify-center transition-all cursor-pointer"
            title="Add more products to this bundle"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout Split */}
      <div className="flex flex-col lg:flex-row flex-grow w-full items-stretch">
        
        {/* Left Panel - Configuration & Form */}
        <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#8F9C86]/15 bg-[#FAF6EE]">
          
          <div className="p-8 lg:p-12 border-b border-[#8F9C86]/15 bg-[#F5F1E6]/20 space-y-6">
            <div className="flex justify-between items-start">
              <span className="inline-block text-xs uppercase tracking-[0.2em] text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-3.5 py-1.5 rounded-full">
                {customizationMode === 'ALL' ? 'Apply-To-All Canvas' : `Bespoke Designer / ${activeItem?.sku}`}
              </span>
              <span className="font-serif text-3xl font-bold text-[#1F2B1A]">
                {customizationMode === 'ALL' ? `$${bundle.price.toFixed(2)}` : `$${activeItem?.basePrice.toFixed(2)}`}
              </span>
            </div>
            
            <div>
              <h1 className="font-serif text-3xl lg:text-4xl text-[#1F2B1A] uppercase tracking-tight leading-none mb-2">
                {customizationMode === 'ALL' ? bundle.name : activeItem?.productName}
              </h1>
              <p className="text-xs font-sans text-[#1F2B1A]/60 leading-[2.2] uppercase tracking-widest font-semibold">
                {customizationMode === 'ALL' 
                  ? 'All customizable items in this box will be rendered independently with this branding set.' 
                  : activeItem?.description
                }
              </p>
            </div>

            {/* List of elements in ALL mode */}
            {customizationMode === 'ALL' && (
              <div className="space-y-3 pt-2">
                <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono font-bold block">
                  Rendering Targets:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bundleItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/60 border border-[#8F9C86]/10 p-2 rounded-xl text-xs">
                      <div className="w-8 h-10 bg-white border border-[#8F9C86]/5 rounded overflow-hidden flex-shrink-0">
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply opacity-85" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#1F2B1A] uppercase truncate block tracking-wider text-[10px]">{item.productName}</span>
                        <span className="text-[8px] text-[#1F2B1A]/50 block mt-0.5">{item.isCustomizable === false ? 'Included As-Is' : 'Customizable'}</span>
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
                <Copy className="w-3.5 h-3.5" /> Copy Config From Previous Item
              </button>
            )}
          </div>

          {/* Form inputs */}
          <div className="p-8 lg:p-12 flex-grow flex flex-col gap-8 bg-[#FAF6EE]">
            
            {/* Step 1: Intent Prompt */}
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
                  placeholder="Tell us what you have in mind. E.g., 'Centered logo with gold accents. Symmetrical corporate feel.'"
                  value={prompt}
                  maxLength={500}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    if (customizationMode === 'INDIVIDUAL') {
                      updateActiveConfig('prompt', e.target.value);
                    }
                  }}
                />
                <div className="border-t border-[#8F9C86]/15 flex justify-between items-center px-4 py-2 bg-[#F5F1E6]/40">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-[#1F2B1A]/50">Creative Brief</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 font-bold">{prompt.length}/500</span>
                </div>
              </div>

              <div className={`border p-4 rounded-xl flex items-start gap-3 transition-colors ${clarity.color}`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold block">Prompt Clarity: {clarity.label}</span>
                  <span className="text-[9px] uppercase tracking-wider block font-sans opacity-80 leading-normal">{clarity.tip}</span>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Logo */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">// Step 02 — Upload Brand Logo</label>
              
              {logoUrl ? (
                <div className="border border-[#8F9C86]/25 rounded-2xl p-4 bg-[#F5F1E6]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain bg-white/40 border border-[#8F9C86]/10 p-1 rounded-lg grayscale" />
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-[#1F2B1A] block">Asset Loaded</span>
                      <span className="text-[9px] text-[#1F2B1A]/50 block font-mono">VISION ANALYZED READY</span>
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
                  htmlFor="logo-upload-active"
                  className="border border-dashed border-[#8F9C86]/40 rounded-2xl bg-[#FAF9F5]/40 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] flex flex-col justify-center items-center p-8 cursor-pointer transition-all duration-500 text-center shadow-sm group"
                >
                  <input 
                    type="file" 
                    id="logo-upload-active" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload} 
                  />
                  <Package className="w-5 h-5 mb-2 opacity-50 group-hover:scale-110 transition-all" />
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A] group-hover:text-[#FAF6EE]">Upload Logo</span>
                  <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/40 group-hover:text-[#FAF6EE]/70 mt-1">SVG / Transparent PNG (10MB Max)</span>
                </label>
              )}
            </div>

            {/* Step 3: Text Lines */}
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">// Step 03 — Printed Lettering</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative border-b border-[#8F9C86]/20 pb-1.5 focus-within:border-[#D27D5B]">
                  <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Main text line</label>
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
                  <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Supporting text line</label>
                  <input
                    type="text"
                    maxLength={60}
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                    placeholder="TAGLINE / YEAR (MAX 60)"
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

            {/* Step 4: Packaging message */}
            <div className="space-y-3 border-t border-[#8F9C86]/15 pt-6">
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">// Step 04 — Packaging Insert message (Not Printed)</label>
              <div className="relative border border-[#8F9C86]/25 rounded-2xl bg-[#F5F1E6]/10 overflow-hidden focus-within:border-[#D27D5B]/70 transition-colors">
                <textarea
                  className="w-full h-24 pt-4 px-4 pb-3 bg-transparent text-xs font-sans uppercase tracking-widest leading-[2] text-[#1F2B1A] focus:outline-none resize-none placeholder:text-[#1F2B1A]/30"
                  placeholder="Personal gift message that accompanies the bundle unboxing experience..."
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
                  <span>This insert message is written on cards</span>
                  <span>{giftMessage.length}/200</span>
                </div>
              </div>
            </div>

            {/* Step 5: Advanced Options */}
            <div className="border-t border-[#8F9C86]/15 pt-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors flex items-center gap-1.5 cursor-pointer"
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
                      <option value="Center">Front Symmetrical Center</option>
                      <option value="Left Chest">Left Chest Area</option>
                      <option value="Right Chest">Right Chest Area</option>
                      <option value="Sleeve">Sleeve Wrap / Edge</option>
                      <option value="Back">Large Back Placement</option>
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
                      <option value="Gold">Metallic Gold Foil</option>
                      <option value="Silver">Metallic Silver Foil</option>
                      <option value="White">Matte White Ink</option>
                      <option value="Black">Matte Black Ink</option>
                      <option value="Terracotta">Terracotta Clay</option>
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
                      <option value="Auto">Auto-Select Cohesive</option>
                      <option value="Serif">Serif (Traditional Luxury)</option>
                      <option value="Sans-serif">Sans-serif (Modern Minimalist)</option>
                      <option value="Script">Script (Bespoke Hand-drawn)</option>
                      <option value="Bold Display">Strong Impact Editorial</option>
                    </select>
                  </div>

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
                      <option value="No Change">No Change (Default Studio)</option>
                      <option value="Subtle Pattern">Subtle Brand Pattern</option>
                      <option value="Solid Color Fill">Solid Color Fill Background</option>
                    </select>
                  </div>

                  {backgroundTreatment === 'Solid Color Fill' && (
                    <div className="md:col-span-2 relative border-b border-[#8F9C86]/20 pb-1.5 flex items-center gap-4">
                      <div className="flex-grow">
                        <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Background Hex</label>
                        <input
                          type="text"
                          className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none"
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

            {/* Execute Generation Button */}
            {itemIsCustomizable ? (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
              >
                {isGenerating 
                  ? customizationMode === 'ALL' 
                    ? 'Rendering All Previews Individually...' 
                    : `Rendering Branded ${activeItem?.productName}...`
                  : customizationMode === 'ALL'
                    ? 'Execute Previews Generation'
                    : 'Execute Preview Rendering'
                }
              </button>
            ) : (
              <div className="py-4 border border-dashed border-[#8F9C86]/20 rounded-2xl bg-[#F5F1E6]/25 text-center text-xs uppercase tracking-widest text-[#1F2B1A]/50 font-bold">
                No customization available for this component
              </div>
            )}
            
          </div>
        </div>

        {/* Right Panel - Live Proof Viewport */}
        <div className="w-full lg:w-[55%] bg-[#1F2B1A] relative flex flex-col justify-center items-center p-6 lg:p-16 overflow-hidden min-h-[500px]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(210,125,91,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(210,125,91,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          <div className="relative w-full max-w-2xl aspect-square border border-[#8F9C86]/15 bg-[#FAF6EE] p-6 lg:p-12 rounded-[2rem] shadow-2xl flex flex-col justify-between">
            
            {/* Conditional overlays for inputs changed, errors, or generating */}
            {hasInputsChanged(activeItem?.productId) && (
              <div className="absolute top-4 left-4 right-4 bg-yellow-500/95 text-[#1F2B1A] px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-extrabold flex items-center gap-2 shadow-lg backdrop-blur-sm z-30">
                <AlertCircle className="w-4 h-4 text-[#1F2B1A]" />
                <span>Notice: Design inputs changed. Click Execute rendering to regenerate.</span>
              </div>
            )}

            {currentConfig?.error ? (
              /* Failure state: show original image with error & retry button */
              <div className="w-full h-full relative flex flex-col justify-center items-center rounded-2xl overflow-hidden">
                <img src={activeItem?.productImage} alt={activeItem?.productName} className="w-full h-full object-cover mix-blend-multiply opacity-40 filter sepia-[0.03]" />
                <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-red-600 mb-3 animate-pulse" />
                  <span className="text-xs uppercase tracking-widest font-bold text-red-800">Preview Generation Failed</span>
                  <p className="text-[10px] uppercase tracking-wider text-red-800/80 mt-1 max-w-xs">{currentConfig.error}</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-4 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white text-[10px] uppercase tracking-widest font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Generation
                  </button>
                </div>
              </div>
            ) : !previewGenerated && !currentConfig?.isGenerating ? (
              /* Awaiting parameters */
              <div className="w-full h-full border border-[#1F2B1A]/5 rounded-[1.5rem] flex flex-col items-center justify-center relative bg-[#F5F1E6]/40">
                <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
                  <span className="font-serif italic text-[11rem] text-[#1F2B1A]">unboxing.</span>
                </div>
                <div className="text-center z-10 space-y-4 px-6">
                  <div className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A]">
                    Studio Active Viewport
                  </div>
                  <div className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 max-w-xs mx-auto leading-[2] font-semibold">
                    {customizationMode === 'ALL' 
                      ? 'Submit parameter directives to generate separate photorealistic brand proofs across all customizable elements.' 
                      : `Submit specifications to generate customized visualization for ${activeItem?.productName}.`
                    }
                  </div>
                </div>
              </div>
            ) : currentConfig?.isGenerating ? (
              /* Rendering Spinner */
              <div className="w-full h-full border border-[#1F2B1A]/5 rounded-[1.5rem] flex flex-col items-center justify-center relative bg-[#F5F1E6]/40 z-20">
                <RefreshCw className="w-8 h-8 text-[#D27D5B] animate-spin mb-4" />
                <div className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A]">
                  Generating Branded Preview...
                </div>
                <div className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 mt-1 font-mono">
                  Synthesizing lighting, placement, and texture alignments.
                </div>
              </div>
            ) : (
              /* Photorealistic Image preview */
              <div className="w-full h-full flex flex-col relative group rounded-[1.5rem] overflow-hidden">
                <img
                  src={previewUrl || undefined}
                  alt="Custom Suite Render"
                  className="w-full h-full object-cover filter sepia-[0.03]"
                />
                
                {/* Interpretation Summary overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#FAF6EE] border-t border-[#8F9C86]/10 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-4">
                    <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-pulse"></span>
                    <div>
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 block mb-1">AI Interpretation Log</span>
                      <span className="text-xs uppercase tracking-widest text-[#1F2B1A] leading-snug block font-bold">
                        {interpretation}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {previewGenerated && !currentConfig?.isGenerating && !currentConfig?.error && (
            <div className="mt-12 flex w-full max-w-2xl gap-4 relative z-10">
              <button 
                onClick={handleGenerate}
                className="flex-1 py-4.5 border border-[#FAF6EE]/20 text-[#FAF6EE] text-[10px] tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate Variation
              </button>
              <button 
                onClick={customizationMode === 'ALL' ? handleApproveAll : handleApproveItem}
                className="flex-1 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-[10px] tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-300 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {customizationMode === 'ALL' ? (
                  <>Approve Design & view package proof <ArrowRight className="w-4 h-4" /></>
                ) : activeIndex < bundleItems.length - 1 ? (
                  <>Approve & Next Item <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>Approve & View Package Proof <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
          
        </div>

      </div>

      {/* Shared Design Modal Prompt (ALL mode only) */}
      {showApplyToAllPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1F2B1A]/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FAF6EE] border border-[#8F9C86]/20 p-8 rounded-[2rem] shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <Sparkles className="w-8 h-8 text-[#D27D5B] mx-auto animate-pulse" />
              <h3 className="font-serif text-xl uppercase tracking-tight text-[#1F2B1A]">Apply Design to {showApplyToAllPrompt.product.productName}?</h3>
              <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 leading-relaxed font-bold">
                Would you like to automatically apply the existing shared design parameters to this newly added product?
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleConfirmApplyToAll(true)}
                className="w-full py-3 bg-[#D27D5B] text-[#FAF6EE] hover:bg-[#1F2B1A] text-xs uppercase tracking-widest font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Apply Automatically
              </button>
              <button
                onClick={() => handleConfirmApplyToAll(false)}
                className="w-full py-3 bg-transparent border border-[#1F2B1A]/20 hover:border-[#1F2B1A] hover:bg-[#1F2B1A]/5 text-[#1F2B1A] text-xs uppercase tracking-widest font-bold rounded-full transition-all cursor-pointer"
              >
                Customize separately
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Side Panel */}
      {renderCatalogPanel()}
    </div>
  );

  // Side-over Panel: Full search/filterable product catalog
  function renderCatalogPanel() {
    if (!isCatalogOpen) return null;
    return (
      <div className="fixed inset-0 z-50 overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[#1F2B1A]/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCatalogOpen(false)} />
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md bg-[#FAF6EE] border-l border-[#8F9C86]/20 shadow-2xl flex flex-col h-full">
            
            {/* Catalog Panel Header */}
            <div className="px-6 py-5 border-b border-[#8F9C86]/10 flex justify-between items-center">
              <h2 className="font-serif text-xl uppercase tracking-tight text-[#1F2B1A] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#D27D5B]" /> Add Products
              </h2>
              <button 
                onClick={() => setIsCatalogOpen(false)} 
                className="p-1 hover:bg-[#1F2B1A]/5 rounded-full text-[#1F2B1A]/60 hover:text-[#1F2B1A] border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search & Filter bar inside side-panel */}
            <div className="p-4 bg-[#F5F1E6]/40 space-y-4 border-b border-[#8F9C86]/10">
              <div className="relative border border-[#8F9C86]/25 rounded-xl bg-white focus-within:border-[#D27D5B] transition-colors flex items-center px-3 py-2">
                <Search className="w-4 h-4 text-[#1F2B1A]/40 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search catalog products..." 
                  value={catalogSearch} 
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none text-[#1F2B1A] uppercase tracking-wider font-semibold"
                />
              </div>

              {/* Category buttons row */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Apparel', 'Drinkware', 'Stationery', 'Tech', 'Culinary'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCat(cat)}
                    className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-extrabold transition-all cursor-pointer ${
                      catalogCat === cat ? 'bg-[#1F2B1A] text-[#FAF6EE]' : 'bg-white/60 border border-[#8F9C86]/15 text-[#1F2B1A]/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Product List Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-xs uppercase tracking-wider text-[#1F2B1A]/40 py-12">No products found matching criteria</p>
              ) : (
                filteredProducts.map(prod => {
                  const images = prod.images as string[];
                  const imageUrl = images?.[0] || '';
                  const alreadyInBundle = bundleItems.some(item => item.productId === prod.id);

                  return (
                    <div 
                      key={prod.id} 
                      className={`flex gap-4 p-4 rounded-2xl transition-all border ${
                        alreadyInBundle ? 'bg-[#F5F1E6]/20 border-[#8F9C86]/20 opacity-60' : 'bg-white/40 border-[#8F9C86]/10 hover:bg-white/80'
                      }`}
                    >
                      <div className="w-16 h-20 bg-[#FAF9F5] border border-[#8F9C86]/10 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={imageUrl} alt={prod.name} className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] font-mono font-bold uppercase text-[#1F2B1A]/40">{prod.sku}</span>
                            <span className="text-xs font-mono font-bold text-[#1F2B1A]/80">${prod.basePrice.toFixed(2)}</span>
                          </div>
                          <h4 className="font-serif text-sm text-[#1F2B1A] uppercase tracking-tight truncate">{prod.name}</h4>
                          <p className="text-[8px] uppercase tracking-widest text-[#D27D5B] font-bold mt-1 bg-[#D27D5B]/5 border border-[#D27D5B]/15 px-2 py-0.5 rounded-full inline-block">{prod.category}</p>
                        </div>

                        <button
                          onClick={() => handleAddProductToBundle(prod)}
                          disabled={alreadyInBundle}
                          className="w-full mt-3 py-1.5 bg-[#D27D5B] text-[#FAF6EE] hover:bg-[#1F2B1A] disabled:bg-gray-200 disabled:text-gray-400 text-[9px] uppercase tracking-widest font-extrabold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border-0"
                        >
                          {alreadyInBundle ? 'Already Added' : <><Plus className="w-3.5 h-3.5" /> Add To Bundle</>}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }
}
