import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="w-full relative px-6 lg:px-12 py-12 space-y-16 animate-bloom">
      
      {/* Top Border line */}
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0 left-0"></div>

      {/* Main Header Card */}
      <header className="p-10 lg:p-16 bg-[#F5F1E6]/50 backdrop-blur-[2px] rounded-[2.5rem] border border-[#8F9C86]/15 shadow-sm text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full"></span>
          Our Philosophy // Origin Story
        </span>
        <h1 className="font-serif text-5xl md:text-7xl text-[#1F2B1A] uppercase tracking-tighter">
          The Story of <span className="italic font-light lowercase text-[#D27D5B]">Sitota</span>.
        </h1>
        <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-[#1F2B1A]/70 max-w-xl mx-auto leading-[2.2] font-sans">
          In Amharic, the word <span className="text-[#D27D5B] font-bold">Sitota</span> translates directly to <span className="italic font-serif">gift</span>. This is the seed from which our entire platform grows.
        </p>
      </header>

      {/* Narrative Section - Split Asymmetric Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Card - Meaning */}
        <div className="p-8 lg:p-12 bg-[#F5F1E6]/30 border border-[#8F9C86]/15 rounded-[2.5rem] space-y-6 shadow-sm">
          <span className="text-xs font-sans font-bold tracking-[0.25em] text-[#D27D5B]">01 / THE COGNITION OF GIVING</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1F2B1A] leading-tight">An Exchange of <span className="italic font-light text-[#D27D5B]">Spirit</span></h2>
          <p className="text-sm text-[#1F2B1A]/80 leading-[2] font-sans font-medium">
            At Sitota, we believe corporate relations have grown sterile and transactional. Gifting has become a matter of bulk synthetic inventory shipped mindlessly across oceans. 
          </p>
          <p className="text-sm text-[#1F2B1A]/80 leading-[2] font-sans font-medium">
            We return to the primal essence of the gesture. A gift should be a warm hearth—crafted with organic, tactile materials like fine clay, woven cotton, and natural oils, extending real respect and honor from sender to designee.
          </p>
        </div>

        {/* Right - Artistic Aspect */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-[#8F9C86]/15 shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop" 
            alt="Artisanal Hand Packaging with Dried Flowers" 
            className="w-full h-full object-cover filter contrast-[1.01] sepia-[0.05]"
          />
          <div className="absolute inset-0 bg-[#1F2B1A]/5 mix-blend-multiply"></div>
        </div>

      </div>

      {/* Central Values Statement */}
      <div className="max-w-4xl mx-auto p-12 lg:p-16 bg-[#1F2B1A] text-[#FAF6EE] rounded-[3rem] border border-[#8F9C86]/10 text-center space-y-8 shadow-xl">
        <span className="text-xs font-sans font-bold tracking-[0.3em] text-[#D27D5B] block">THE SYNTHESIS</span>
        <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl italic tracking-tight leading-snug text-[#FAF6EE]/90 max-w-2xl mx-auto">
          "Marrying responsible botanical curation with the elegance of state-of-the-art AI generation."
        </blockquote>
        <div className="w-16 h-px bg-[#D27D5B] mx-auto"></div>
        <p className="font-sans text-xs md:text-sm uppercase tracking-[0.2em] text-[#FAF6EE]/70 max-w-md mx-auto leading-loose">
          We construct our previews instantly using custom neural pipelines, ensuring zero physical production waste during the design approximation phase.
        </p>
      </div>

      {/* Sustainable Principles Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        
        <div className="p-8 bg-[#F5F1E6]/40 border border-[#8F9C86]/15 rounded-[2rem] space-y-4">
          <span className="text-xs font-sans font-bold tracking-[0.25em] text-[#D27D5B]">PRIN.01</span>
          <h3 className="font-serif text-2xl text-[#1F2B1A]">Artisanal Curation</h3>
          <p className="text-xs md:text-sm text-[#1F2B1A]/80 leading-[1.8] font-sans font-medium">
            We partner with local craftsmen, boutique makers, and eco-certified farms to supply warm, comforting items that reflect genuine care.
          </p>
        </div>

        <div className="p-8 bg-[#F5F1E6]/40 border border-[#8F9C86]/15 rounded-[2rem] space-y-4">
          <span className="text-xs font-sans font-bold tracking-[0.25em] text-[#D27D5B]">PRIN.02</span>
          <h3 className="font-serif text-2xl text-[#1F2B1A]">Zero-Waste Approximations</h3>
          <p className="text-xs md:text-sm text-[#1F2B1A]/80 leading-[1.8] font-sans font-medium">
            Our AI rendering engine removes the need for physical molding, pre-runs, or prototype freight, keeping carbon emissions safely contained.
          </p>
        </div>

        <div className="p-8 bg-[#F5F1E6]/40 border border-[#8F9C86]/15 rounded-[2rem] space-y-4">
          <span className="text-xs font-sans font-bold tracking-[0.25em] text-[#D27D5B]">PRIN.03</span>
          <h3 className="font-serif text-2xl text-[#1F2B1A]">Mindful Distribution</h3>
          <p className="text-xs md:text-sm text-[#1F2B1A]/80 leading-[1.8] font-sans font-medium">
            Every courier campaign is routed mindfully with carbon-neutral logistics, wrapped in biodegradable sugarcane fiber sheets.
          </p>
        </div>

      </div>

      {/* CTA Box */}
      <div className="max-w-xl mx-auto text-center space-y-6 pt-8 pb-16">
        <h2 className="font-serif text-3xl text-[#1F2B1A] uppercase tracking-tight">Ready to curate?</h2>
        <div className="flex justify-center gap-4">
          <Link href="/catalog" className="inline-flex justify-center items-center px-10 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 shadow-md">
            Explore Index
          </Link>
        </div>
      </div>

    </div>
  );
}
