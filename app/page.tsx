import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="min-h-[85vh] flex flex-col justify-center relative overflow-hidden bg-[#FDFBF7]">
        {/* Subtle background texture/pattern could go here */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
          <div className="max-w-3xl">
            <h1 className="font-serif text-6xl md:text-8xl text-[#1c1c1c] leading-[1.05] tracking-tight mb-8">
              The Art of <br />
              <span className="italic text-[#8B7355] font-light">Meaningful</span> Gifting.
            </h1>
            <p className="text-lg md:text-xl text-[#1c1c1c]/70 font-light max-w-xl mb-12 leading-relaxed">
              Elevate your corporate relationships. Preview exquisite, branded gifts instantly with our AI engine, and deliver unforgettable experiences at scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/catalog" className="inline-flex justify-center items-center px-8 py-4 bg-[#1c1c1c] text-[#FDFBF7] text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#333] transition-colors duration-500">
                Explore the Collection
              </Link>
              <Link href="/dashboard" className="inline-flex justify-center items-center px-8 py-4 border border-[#1c1c1c]/20 text-[#1c1c1c] text-xs tracking-[0.2em] uppercase font-semibold hover:border-[#1c1c1c] transition-all duration-500">
                Client Portal
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-1/3 h-full hidden lg:block">
           <img 
             src="https://images.unsplash.com/photo-1607344645866-eea33a4e2e27?q=80&w=1000&auto=format&fit=crop" 
             alt="Elegant Gift" 
             className="w-full h-full object-cover object-left opacity-90"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] to-transparent"></div>
        </div>
      </div>
      
      {/* Three Pillars Section */}
      <div className="bg-[#111] text-[#FDFBF7] py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <div className="group border-t border-white/20 pt-8 hover:border-white/60 transition-colors duration-500">
              <span className="text-[#8B7355] font-serif text-4xl mb-6 block">01</span>
              <h3 className="text-2xl font-serif mb-4">Visionary Previews</h3>
              <p className="text-sm font-light text-white/60 leading-relaxed group-hover:text-white/90 transition-colors">
                Experience exactly how your brand marries with our luxury products before committing. Our proprietary AI rendering engine presents photorealistic concepts instantly.
              </p>
            </div>
            <div className="group border-t border-white/20 pt-8 hover:border-white/60 transition-colors duration-500">
              <span className="text-[#8B7355] font-serif text-4xl mb-6 block">02</span>
              <h3 className="text-2xl font-serif mb-4">Frictionless Scale</h3>
              <p className="text-sm font-light text-white/60 leading-relaxed group-hover:text-white/90 transition-colors">
                From an intimate gesture for a single VIP to a global campaign for thousands. Seamlessly upload recipient lists or let us elegantly handle address collection.
              </p>
            </div>
            <div className="group border-t border-white/20 pt-8 hover:border-white/60 transition-colors duration-500">
              <span className="text-[#8B7355] font-serif text-4xl mb-6 block">03</span>
              <h3 className="text-2xl font-serif mb-4">Curated Excellence</h3>
              <p className="text-sm font-light text-white/60 leading-relaxed group-hover:text-white/90 transition-colors">
                We eschew the generic. Our catalog is meticulously sourced, featuring only premium goods that reflect the high standards of your own brand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
