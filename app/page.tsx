import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full relative px-6 lg:px-12 py-8 space-y-12">
      
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
             src="https://images.unsplash.com/photo-1607344645866-eea33a4e2e27?q=80&w=1200&auto=format&fit=crop" 
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
            <span className="text-xs font-sans font-bold tracking-[0.25em] mb-10 block text-[#D27D5B] group-hover:text-[#FAF6EE]/80">🍃 SYS.01</span>
            <h3 className="text-4xl lg:text-5xl font-serif mb-6 italic tracking-tight text-[#1F2B1A] group-hover:text-[#FAF6EE]">Bespoke Previews</h3>
            <p className="text-xs md:text-sm font-sans uppercase tracking-[0.12em] leading-[2.2] opacity-75 group-hover:opacity-90">
              Experience exactly how your branding flourishes on our organic products. Our custom AI visualization studio presents soft, photorealistic previews instantly.
            </p>
          </div>
          
          <div className="p-10 lg:p-14 bg-[#F5F1E6]/40 backdrop-blur-[1px] border border-[#8F9C86]/15 rounded-[2rem] group hover:bg-[#1F2B1A] hover:text-[#FAF6EE] hover:-translate-y-1 transition-all duration-[0.8s] ease-out shadow-sm hover:shadow-xl">
            <span className="text-xs font-sans font-bold tracking-[0.25em] mb-10 block text-[#D27D5B] group-hover:text-[#FAF6EE]/80">🌸 SYS.02</span>
            <h3 className="text-4xl lg:text-5xl font-serif mb-6 italic tracking-tight text-[#1F2B1A] group-hover:text-[#FAF6EE]">Seamless Scale</h3>
            <p className="text-xs md:text-sm font-sans uppercase tracking-[0.12em] leading-[2.2] opacity-75 group-hover:opacity-90">
              From an intimate token for a single client to an expansive seasonal campaign. Upload lists with ease, or let us gently manage coordinate collection for you.
            </p>
          </div>
          
          <div className="p-10 lg:p-14 bg-[#F5F1E6]/40 backdrop-blur-[1px] border border-[#8F9C86]/15 rounded-[2rem] group hover:bg-[#1F2B1A] hover:text-[#FAF6EE] hover:-translate-y-1 transition-all duration-[0.8s] ease-out shadow-sm hover:shadow-xl">
            <span className="text-xs font-sans font-bold tracking-[0.25em] mb-10 block text-[#D27D5B] group-hover:text-[#FAF6EE]/80">🪵 SYS.03</span>
            <h3 className="text-4xl lg:text-5xl font-serif mb-6 italic tracking-tight text-[#1F2B1A] group-hover:text-[#FAF6EE]">Botanical Sourcing</h3>
            <p className="text-xs md:text-sm font-sans uppercase tracking-[0.12em] leading-[2.2] opacity-75 group-hover:opacity-90">
              We eschew the sterile and synthetic. Our catalog is responsibly sourced, selecting only organic and warm textures that extend genuine grace and meaning.
            </p>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
