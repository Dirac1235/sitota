import Link from 'next/link';

export default function HowItWorks() {
  return (
    <div className="w-full relative px-6 lg:px-12 py-12 space-y-16 animate-bloom">
      
      {/* Top Border line */}
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0 left-0"></div>

      {/* Main Header Card */}
      <header className="p-10 lg:p-16 bg-[#F5F1E6]/50 backdrop-blur-[2px] rounded-[2.5rem] border border-[#8F9C86]/15 shadow-sm text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full"></span>
          Bespoke Curation // Method Log
        </span>
        <h1 className="font-serif text-5xl md:text-7xl text-[#1F2B1A] uppercase tracking-tighter">
          The Gifting <span className="italic font-light lowercase text-[#D27D5B]">process</span>.
        </h1>
        <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-[#1F2B1A]/70 max-w-xl mx-auto leading-[2.2] font-sans">
          Four simple checkpoints to design, personalize, and deploy sustainable corporate campaigns globally.
        </p>
      </header>

      {/* 4 Steps Bento Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        
        {/* Step 1 */}
        <div className="p-8 lg:p-12 bg-[#F5F1E6]/30 border border-[#8F9C86]/15 rounded-[2.5rem] space-y-6 hover:shadow-lg hover:bg-[#FAF9F5]/60 transition-all duration-500 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="font-serif text-6xl text-[#D27D5B] italic leading-none">01</span>
            <span className="block text-xs font-sans font-bold tracking-[0.25em] text-[#1F2B1A]/45">STEP.01 // INDEX SELECTION</span>
            <h3 className="font-serif text-3xl text-[#1F2B1A] tracking-tight">Explore & Curate</h3>
            <p className="text-sm text-[#1F2B1A]/80 leading-[1.8] font-sans font-medium">
              Browse our mindfully sourced index of premium, sustainable items. We eschew toxic polymers and plastics, selecting only tactile, natural products like organic ceramics, fine cotton weaves, and raw wood crafts that reflect real warmth.
            </p>
          </div>
          <div className="pt-4 border-t border-[#8F9C86]/10 text-xs text-[#8F9C86] font-bold tracking-widest uppercase">// EXPLORE CURATED ELEMENTS</div>
        </div>

        {/* Step 2 */}
        <div className="p-8 lg:p-12 bg-[#F5F1E6]/30 border border-[#8F9C86]/15 rounded-[2.5rem] space-y-6 hover:shadow-lg hover:bg-[#FAF9F5]/60 transition-all duration-500 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="font-serif text-6xl text-[#D27D5B] italic leading-none">02</span>
            <span className="block text-xs font-sans font-bold tracking-[0.25em] text-[#1F2B1A]/45">STEP.02 // THE DIRECTIVE</span>
            <h3 className="font-serif text-3xl text-[#1F2B1A] tracking-tight">Describe Your Vision</h3>
            <p className="text-sm text-[#1F2B1A]/80 leading-[1.8] font-sans font-medium">
              Supply your company's design assets (PNG, SVG, or high-res logos) and type a plain-text prompt detailing how your branding should reside on the item. Speak naturally—write it as simply as a hand-penned brief to a designer.
            </p>
          </div>
          <div className="pt-4 border-t border-[#8F9C86]/10 text-xs text-[#8F9C86] font-bold tracking-widest uppercase">// NATURAL LANGUAGE SYNCHRONIZATION</div>
        </div>

        {/* Step 3 */}
        <div className="p-8 lg:p-12 bg-[#F5F1E6]/30 border border-[#8F9C86]/15 rounded-[2.5rem] space-y-6 hover:shadow-lg hover:bg-[#FAF9F5]/60 transition-all duration-500 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="font-serif text-6xl text-[#D27D5B] italic leading-none">03</span>
            <span className="block text-xs font-sans font-bold tracking-[0.25em] text-[#1F2B1A]/45">STEP.03 // THE SYNTHESIS</span>
            <h3 className="font-serif text-3xl text-[#1F2B1A] tracking-tight">Synthesize & Approve</h3>
            <p className="text-sm text-[#1F2B1A]/80 leading-[1.8] font-sans font-medium">
              Our state-of-the-art AI rendering system maps your assets onto the selected item instantly. Examine the photorealistic proof from multiple angles, iterate freely on text placement, and approve when perfectly aligned with your guidelines.
            </p>
          </div>
          <div className="pt-4 border-t border-[#8F9C86]/10 text-xs text-[#8F9C86] font-bold tracking-widest uppercase">// ZERO PRODUCTION WASTE GENERATED</div>
        </div>

        {/* Step 4 */}
        <div className="p-8 lg:p-12 bg-[#F5F1E6]/30 border border-[#8F9C86]/15 rounded-[2.5rem] space-y-6 hover:shadow-lg hover:bg-[#FAF9F5]/60 transition-all duration-500 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="font-serif text-6xl text-[#D27D5B] italic leading-none">04</span>
            <span className="block text-xs font-sans font-bold tracking-[0.25em] text-[#1F2B1A]/45">STEP.04 // LOGISTICS ROUTING</span>
            <h3 className="font-serif text-3xl text-[#1F2B1A] tracking-tight">Harmonious Logistics</h3>
            <p className="text-sm text-[#1F2B1A]/80 leading-[1.8] font-sans font-medium">
              Specify delivery speed and select your recipient list (one VIP or bulk lists). If you don't have their shipping addresses, our system securely invites recipients to supply their coordinates. Everything is routed with carbon-offset logistics.
            </p>
          </div>
          <div className="pt-4 border-t border-[#8F9C86]/10 text-xs text-[#8F9C86] font-bold tracking-widest uppercase">// DEPLOY CAMPAIGN TO DOORSTEPS</div>
        </div>

      </div>

      {/* Final Callout Banner */}
      <div className="max-w-4xl mx-auto p-12 lg:p-16 bg-[#1F2B1A] text-[#FAF6EE] rounded-[3rem] border border-[#8F9C86]/10 text-center space-y-6 shadow-xl">
        <h2 className="font-serif text-4xl text-[#FAF6EE] uppercase tracking-tight">Begin your bespoke order</h2>
        <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-[#FAF6EE]/70 max-w-lg mx-auto leading-loose">
          Select from our catalog, configure with botanical elegance, and send genuine gratitude in under ten minutes.
        </p>
        <div className="pt-4">
          <Link href="/catalog" className="inline-flex justify-center items-center px-10 py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#FAF6EE] hover:text-[#1F2B1A] transition-colors duration-500 shadow-md">
            Explore Index
          </Link>
        </div>
      </div>

    </div>
  );
}
