import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import LandingFaq from './components/LandingFaq';
import { Sparkles, Compass, Send, ArrowRight, Quote } from 'lucide-react';

const prisma = new PrismaClient();

const fallbackProducts = [
  {
    id: "mock-1",
    sku: "DRK-001",
    name: "Premium Ceramic Mug",
    category: "Drinkware",
    basePrice: 15.0,
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600"]
  },
  {
    id: "mock-2",
    sku: "AP-002",
    name: "Cashmere Blend Hoodie",
    category: "Apparel",
    basePrice: 85.0,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600"]
  },
  {
    id: "mock-3",
    sku: "ST-003",
    name: "Hand-Stitched Leather Notebook",
    category: "Stationery",
    basePrice: 45.0,
    images: ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600"]
  },
  {
    id: "mock-4",
    sku: "CUL-012",
    name: "Cedarwood Soy Wax Candle",
    category: "Culinary",
    basePrice: 32.0,
    images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600"]
  }
];

export default async function Home() {
  // Safe DB fetch for featured items
  const dbProducts = await prisma.product.findMany({
    take: 4,
    orderBy: {
      sku: 'asc'
    }
  }).catch((err) => {
    console.error("Prisma failed to load featured products on landing page", err);
    return [];
  });

  const featuredProducts = dbProducts.length > 0 ? dbProducts : fallbackProducts;

  return (
    <div className="w-full relative px-6 lg:px-12 py-8 space-y-16 lg:space-y-24 bg-transparent">
      
      {/* Hero Section - Soft Rounded Split Layout */}
      <div className="flex flex-col lg:flex-row relative gap-8 min-h-[75vh] items-stretch animate-bloom">
        
        {/* Left Typography Pane */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 bg-[#F5F1E6]/50 backdrop-blur-[2px] rounded-[2.5rem] border border-[#8F9C86]/15 relative z-10 shadow-sm">
          <div className="space-y-4 pt-4 reveal-text reveal-delay-1">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] flex items-center gap-2">
              <span className="w-2 h-2 bg-[#D27D5B] rounded-full"></span>
              Vol. 01 — Bespoke Gifting
            </span>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl text-[#1F2B1A] leading-[0.9] tracking-tighter uppercase mt-4">
              Breathe <br />
              <span className="italic font-light lowercase text-[#D27D5B]">beauty</span> <br />
              Into gifts.
            </h1>
          </div>

          <div className="mt-16 lg:mt-0 reveal-text reveal-delay-2">
            <p className="font-sans text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/80 max-w-md mb-10 leading-[2.2]">
              Elevate your connections. Render custom brand assets instantly onto our luxurious, organic items with AI precision, and send comfort globally.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalog" className="inline-flex justify-center items-center px-10 py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 shadow-md hover:shadow-lg">
                Explore Index
              </Link>
              <Link href="/dashboard" className="inline-flex justify-center items-center px-10 py-5 bg-transparent border border-[#1F2B1A]/20 text-[#1F2B1A] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A]/5 transition-all duration-500">
                Workspace Portal
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right Image Pane */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto relative overflow-hidden rounded-[2.5rem] group border border-[#8F9C86]/15 shadow-md">
           <img 
             src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop" 
             alt="Elegant Gift Box in Natural Light" 
             className="w-full h-full object-cover object-center scale-102 group-hover:scale-105 transition-all duration-[2.5s] ease-out filter contrast-[1.02] sepia-[0.05]"
           />
           <div className="absolute inset-0 bg-[#1F2B1A]/10 mix-blend-multiply"></div>
           
           {/* Floating Badge */}
           <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 bg-[#FAF6EE] px-6 py-4 rounded-full border border-[#8F9C86]/20 shadow-lg reveal-text reveal-delay-3 flex items-center gap-2.5">
             <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A] flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#8F9C86] rounded-full animate-pulse"></span>
                🍃 Botanical Render Engine
             </span>
           </div>
        </div>
      </div>
      
      {/* Marquee Banner - Soft Curved Ribbon */}
      <div className="bg-[#D27D5B] text-[#FAF6EE] py-4.5 overflow-hidden rounded-[1.5rem] shadow-sm">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
          {Array(4).fill(0).map((_, i) => (
            <span key={i} className="text-xs uppercase tracking-[0.4em] font-bold mx-8 flex items-center gap-4">
              🍃 Organic Harmonization <span className="text-[#FAF6EE]/50">/</span> ✨ Photorealistic Previews <span className="text-[#FAF6EE]/50">/</span> 🌸 Frictionless Scale <span className="text-[#FAF6EE]/50">/</span>
            </span>
          ))}
        </div>
      </div>
      
      {/* Three Pillars Section (Soft Asymmetric Bento Grid) */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="p-10 lg:p-14 bg-[#F5F1E6]/40 backdrop-blur-[1px] border border-[#8F9C86]/15 rounded-[2rem] group hover:bg-[#1F2B1A] hover:text-[#FAF6EE] hover:-translate-y-1 transition-all duration-[0.8s] ease-out shadow-sm hover:shadow-xl">
            <span className="text-xs font-sans font-bold tracking-[0.25em] mb-10 block text-[#D27D5B] group-hover:text-[#FAF6EE]/80">🍃 01</span>
            <h3 className="text-4xl lg:text-5xl font-serif mb-6 italic tracking-tight text-[#1F2B1A] group-hover:text-[#FAF6EE]">Bespoke Previews</h3>
            <p className="text-xs md:text-sm font-sans uppercase tracking-[0.12em] leading-[2.2] opacity-75 group-hover:opacity-90">
              Experience exactly how your branding flourishes on our organic products. Our custom AI visualization studio presents soft, photorealistic previews instantly.
            </p>
          </div>
          
          <div className="p-10 lg:p-14 bg-[#F5F1E6]/40 backdrop-blur-[1px] border border-[#8F9C86]/15 rounded-[2rem] group hover:bg-[#1F2B1A] hover:text-[#FAF6EE] hover:-translate-y-1 transition-all duration-[0.8s] ease-out shadow-sm hover:shadow-xl">
            <span className="text-xs font-sans font-bold tracking-[0.25em] mb-10 block text-[#D27D5B] group-hover:text-[#FAF6EE]/80">🌸 02</span>
            <h3 className="text-4xl lg:text-5xl font-serif mb-6 italic tracking-tight text-[#1F2B1A] group-hover:text-[#FAF6EE]">Seamless Scale</h3>
            <p className="text-xs md:text-sm font-sans uppercase tracking-[0.12em] leading-[2.2] opacity-75 group-hover:opacity-90">
              From an intimate token for a single client to an expansive seasonal campaign. Upload lists with ease, or let us gently manage coordinate collection for you.
            </p>
          </div>
          
          <div className="p-10 lg:p-14 bg-[#F5F1E6]/40 backdrop-blur-[1px] border border-[#8F9C86]/15 rounded-[2rem] group hover:bg-[#1F2B1A] hover:text-[#FAF6EE] hover:-translate-y-1 transition-all duration-[0.8s] ease-out shadow-sm hover:shadow-xl">
            <span className="text-xs font-sans font-bold tracking-[0.25em] mb-10 block text-[#D27D5B] group-hover:text-[#FAF6EE]/80">🪵 03</span>
            <h3 className="text-4xl lg:text-5xl font-serif mb-6 italic tracking-tight text-[#1F2B1A] group-hover:text-[#FAF6EE]">Botanical Sourcing</h3>
            <p className="text-xs md:text-sm font-sans uppercase tracking-[0.12em] leading-[2.2] opacity-75 group-hover:opacity-90">
              We eschew the sterile and synthetic. Our catalog is responsibly sourced, selecting only organic and warm textures that extend genuine grace and meaning.
            </p>
          </div>
          
        </div>
      </div>

      {/* Visual Step-by-Step Path Section */}
      <div className="w-full py-8 lg:py-16 border-t border-[#8F9C86]/10">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] flex items-center justify-center gap-2">
            🌿 Harmonious Journey
          </span>
          <h2 className="font-serif text-5xl lg:text-6xl text-[#1F2B1A] uppercase tracking-tighter leading-none">
            How Sitota <span className="italic font-light lowercase text-[#D27D5B]">unfolds</span>.
          </h2>
          <p className="font-sans text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/70 max-w-lg mx-auto leading-relaxed">
            Three simple steps carefully structured to elevate your organizational gifting from operational stress to artistic satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Decorative connector line for wide screens */}
          <div className="hidden md:block absolute top-[50px] left-[15%] right-[15%] h-[1px] border-t border-dashed border-[#8F9C86]/25 z-0" />

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-6 relative z-10 group">
            <div className="w-24 h-24 rounded-full bg-[#FAF6EE] border-2 border-[#8F9C86]/20 flex items-center justify-center text-[#D27D5B] group-hover:bg-[#1F2B1A] group-hover:text-[#FAF6EE] group-hover:border-[#1F2B1A] transition-all duration-700 shadow-md">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#D27D5B] uppercase">01 / Selection</span>
              <h4 className="font-serif text-2xl text-[#1F2B1A] italic">Curate the Medium</h4>
              <p className="text-xs font-sans uppercase tracking-[0.1em] text-[#1F2B1A]/75 leading-loose max-w-xs mx-auto">
                Select from our catalog of raw cotton textiles, vegetable-tanned leather, hand-blown glass, and rich botanicals.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-6 relative z-10 group">
            <div className="w-24 h-24 rounded-full bg-[#FAF6EE] border-2 border-[#8F9C86]/20 flex items-center justify-center text-[#D27D5B] group-hover:bg-[#1F2B1A] group-hover:text-[#FAF6EE] group-hover:border-[#1F2B1A] transition-all duration-700 shadow-md">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#D27D5B] uppercase">02 / Visualization</span>
              <h4 className="font-serif text-2xl text-[#1F2B1A] italic">Render your Vision</h4>
              <p className="text-xs font-sans uppercase tracking-[0.1em] text-[#1F2B1A]/75 leading-loose max-w-xs mx-auto">
                Upload your custom brand mark. Our real-time canvas wraps, debosses, or engraves your design instantly on the item.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-6 relative z-10 group">
            <div className="w-24 h-24 rounded-full bg-[#FAF6EE] border-2 border-[#8F9C86]/20 flex items-center justify-center text-[#D27D5B] group-hover:bg-[#1F2B1A] group-hover:text-[#FAF6EE] group-hover:border-[#1F2B1A] transition-all duration-700 shadow-md">
              <Send className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#D27D5B] uppercase">03 / Distribution</span>
              <h4 className="font-serif text-2xl text-[#1F2B1A] italic">Deliver Comfort</h4>
              <p className="text-xs font-sans uppercase tracking-[0.1em] text-[#1F2B1A]/75 leading-loose max-w-xs mx-auto">
                Input addresses, or use our digital coordinate collector to safely request delivery locations. We pack and ship globally.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Spotlight Collection Section */}
      <div className="w-full py-8 lg:py-16 border-t border-[#8F9C86]/10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-16">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] flex items-center gap-2">
              ✨ Crafted Essences
            </span>
            <h2 className="font-serif text-5xl lg:text-6xl text-[#1F2B1A] uppercase tracking-tighter leading-none">
              Featured <span className="italic font-light lowercase text-[#D27D5B]">Catalog</span> spotlight.
            </h2>
            <p className="font-sans text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/70 leading-[2.2]">
              A precise preview of our premium tactile mediums, chosen for corporate partners who cherish outstanding organic textures.
            </p>
          </div>
          <Link href="/catalog" className="inline-flex items-center gap-3 px-8 py-4 border border-[#1F2B1A]/20 hover:border-[#D27D5B] text-[#1F2B1A] hover:text-[#D27D5B] text-xs tracking-[0.25em] uppercase font-bold rounded-full transition-all duration-500 bg-[#FAF9F5]/40 backdrop-blur-[1px] hover:shadow-md">
            View All Index <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => {
            const imagesArray = Array.isArray(product.images) ? (product.images as string[]) : [];
            const imageUrl = imagesArray[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';
            
            return (
              <Link 
                key={product.id}
                href={`/catalog/${product.id}`}
                className="group block bg-[#F5F1E6]/25 hover:bg-[#FAF9F5] border border-[#8F9C86]/12 hover:border-[#D27D5B] rounded-[2.2rem] p-5 transition-all duration-[0.8s] ease-out hover:-translate-y-1.5 hover:shadow-2xl shadow-sm cursor-pointer"
              >
                {/* Image aspect-square with soft inner glow & zoom */}
                <div className="relative aspect-square overflow-hidden bg-[#F5F1E6]/40 rounded-[1.8rem] mb-6 shadow-inner border border-[#8F9C86]/5">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-center scale-100 group-hover:scale-104 transition-all duration-[1.5s] ease-out mix-blend-multiply opacity-95 group-hover:opacity-100 filter sepia-[0.03]"
                  />
                  
                  {/* Floating Sku Monospace Tag */}
                  <div className="absolute top-4 left-4 border border-[#8F9C86]/15 bg-[#FAF6EE]/90 backdrop-blur-[2px] px-3.5 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-mono font-bold text-[#1F2B1A]/60 shadow-sm group-hover:border-[#D27D5B]/30 group-hover:text-[#D27D5B] transition-colors duration-500">
                    {product.sku}
                  </div>

                  {/* Hover Reveal Bespoke Badge */}
                  <div className="absolute inset-0 bg-[#1F2B1A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="bg-[#FAF6EE] text-[#1F2B1A] border border-[#8F9C86]/20 text-xs uppercase tracking-[0.25em] px-8 py-4 font-bold rounded-full shadow-md translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      Bespoke Studio
                    </span>
                  </div>
                </div>
                
                {/* Product Meta details */}
                <div className="px-2 space-y-4">
                  <div className="space-y-2">
                    <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#D27D5B] font-bold">
                      <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full"></span>
                      {product.category}
                    </span>
                    <h3 className="font-serif text-xl lg:text-2xl text-[#1F2B1A] group-hover:text-[#D27D5B] transition-colors tracking-tight leading-snug">
                      {product.name}
                    </h3>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-[#8F9C86]/10 pt-4">
                    <span className="text-[8px] uppercase tracking-widest text-[#1F2B1A]/40 font-bold font-mono">Unit Value</span>
                    <span className="font-mono text-xs tracking-wider text-[#1F2B1A]/80 font-bold">
                      ${product.basePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* High-End Editorial Client Stories (Testimonials) */}
      <div className="w-full py-8 lg:py-16 border-t border-[#8F9C86]/10">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] flex items-center justify-center gap-2">
            🌱 Client Testimonials
          </span>
          <h2 className="font-serif text-5xl lg:text-6xl text-[#1F2B1A] uppercase tracking-tighter leading-none">
            Trusted by creative <br /><span className="italic font-light lowercase text-[#D27D5B]">pioneers</span>.
          </h2>
          <p className="font-sans text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/70 max-w-lg mx-auto leading-relaxed">
            Read from leaders who shifted their corporate appreciation from boring plastic items to authentic sensory keepsakes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Quote 1 */}
          <div className="p-8 lg:p-12 bg-[#F5F1E6]/30 border border-[#8F9C86]/15 rounded-[2.5rem] flex flex-col justify-between relative space-y-8 hover:border-[#D27D5B]/30 transition-all duration-500 shadow-sm">
            <Quote className="w-10 h-10 text-[#D27D5B]/20 absolute top-8 right-8" />
            <p className="font-serif text-lg lg:text-xl text-[#1F2B1A] leading-relaxed italic pt-4">
              "Sitota completely redefined how our agency handles client welcome gifts. Uploading our brand logo onto raw ceramic mugs was seamless, and the photorealistic renders were exact. Our clients were genuinely moved."
            </p>
            <div className="flex items-center gap-4 border-t border-[#8F9C86]/10 pt-6">
              <div className="w-11 h-11 rounded-full bg-[#8F9C86]/20 overflow-hidden flex items-center justify-center font-serif text-[#1F2B1A] font-bold">
                AL
              </div>
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#1F2B1A]">Astrid Lindgren</h5>
                <p className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/60">Creative Director, Väst Studio</p>
              </div>
            </div>
          </div>

          {/* Quote 2 */}
          <div className="p-8 lg:p-12 bg-[#F5F1E6]/30 border border-[#8F9C86]/15 rounded-[2.5rem] flex flex-col justify-between relative space-y-8 hover:border-[#D27D5B]/30 transition-all duration-500 shadow-sm">
            <Quote className="w-10 h-10 text-[#D27D5B]/20 absolute top-8 right-8" />
            <p className="font-serif text-lg lg:text-xl text-[#1F2B1A] leading-relaxed italic pt-4">
              "We welcome global employees with organic cashmere hoodies and hand-stitched leather notebooks. Sitota's address collector links completely take the stress out of onboarding logistics. Absolute perfection."
            </p>
            <div className="flex items-center gap-4 border-t border-[#8F9C86]/10 pt-6">
              <div className="w-11 h-11 rounded-full bg-[#D27D5B]/10 overflow-hidden flex items-center justify-center font-serif text-[#D27D5B] font-bold">
                KO
              </div>
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#1F2B1A]">Kofi Osei</h5>
                <p className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/60">VP of People, BloomTech</p>
              </div>
            </div>
          </div>

          {/* Quote 3 */}
          <div className="p-8 lg:p-12 bg-[#F5F1E6]/30 border border-[#8F9C86]/15 rounded-[2.5rem] flex flex-col justify-between relative space-y-8 hover:border-[#D27D5B]/30 transition-all duration-500 shadow-sm">
            <Quote className="w-10 h-10 text-[#D27D5B]/20 absolute top-8 right-8" />
            <p className="font-serif text-lg lg:text-xl text-[#1F2B1A] leading-relaxed italic pt-4">
              "Most brand merchandise feels plastic and disposable. Sitota is the complete opposite. The solid brushed brass rulers and cedarwood amber candles are sensory objects of art that people keep on their desks forever."
            </p>
            <div className="flex items-center gap-4 border-t border-[#8F9C86]/10 pt-6">
              <div className="w-11 h-11 rounded-full bg-[#1F2B1A]/10 overflow-hidden flex items-center justify-center font-serif text-[#1F2B1A] font-bold">
                ER
              </div>
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#1F2B1A]">Elena Rostova</h5>
                <p className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/60">Founder, Solis Editorial</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Elegant FAQ Accordion Section */}
      <div className="w-full py-8 lg:py-16 border-t border-[#8F9C86]/10">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] flex items-center justify-center gap-2">
            💡 Curated Knowledge
          </span>
          <h2 className="font-serif text-5xl lg:text-6xl text-[#1F2B1A] uppercase tracking-tighter leading-none">
            Commonly <span className="italic font-light lowercase text-[#D27D5B]">inquired</span>.
          </h2>
          <p className="font-sans text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/70 max-w-lg mx-auto leading-relaxed">
            Find answers to standard questions about personalization mechanics, minimum constraints, custom packaging, and shipping options.
          </p>
        </div>

        <LandingFaq />
      </div>

      {/* Warm Sunset Call-to-Action (CTA) */}
      <div className="w-full py-16 lg:py-24 bg-[#D27D5B] text-[#FAF6EE] rounded-[3rem] text-center space-y-8 px-6 relative overflow-hidden shadow-xl">
        {/* Decorative subtle sun-glow overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/10 opacity-60 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] font-bold opacity-80 flex items-center justify-center gap-2">
            🌿 Begin Vol. 01 Gifting
          </span>
          <h2 className="font-serif text-6xl md:text-7xl lg:text-8xl tracking-tighter uppercase leading-[0.9]">
            Cultivate deeper <br />
            <span className="italic font-light lowercase text-[#FAF6EE]/90">ties</span>.
          </h2>
          <p className="font-sans text-xs md:text-sm uppercase tracking-[0.15em] text-[#FAF6EE]/80 max-w-lg mx-auto leading-loose pb-4">
            Create your custom workspace today. Build digital designs onto our catalog items instantly, and establish an appreciation workflow that resonates.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="inline-flex justify-center items-center px-10 py-5 bg-[#1F2B1A] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-white hover:text-[#1F2B1A] transition-colors duration-500 shadow-lg">
              Establish Account
            </Link>
            <Link href="/catalog" className="inline-flex justify-center items-center px-10 py-5 bg-transparent border border-[#FAF6EE]/40 hover:border-white text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE]/10 transition-colors duration-500">
              Browse Mediums
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}