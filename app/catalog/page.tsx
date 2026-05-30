import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Catalog({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category;

  // Fetch products from PostgreSQL, optionally filtering by category
  const products = await prisma.product.findMany({
    where: activeCategory ? { category: activeCategory } : undefined,
    orderBy: {
      sku: 'asc'
    }
  });

  return (
    <div className="w-full relative min-h-screen px-6 lg:px-12 py-8 space-y-12 animate-bloom bg-transparent">

      {/* Warm Premium Header Section */}
      <header className="p-8 lg:p-14 bg-[#F5F1E6]/40 backdrop-blur-[2px] rounded-[2.5rem] border border-[#8F9C86]/15 flex flex-col lg:flex-row lg:items-end justify-between shadow-sm gap-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full"></span>
            Curated Collection
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-[#1F2B1A] leading-none uppercase tracking-tighter mb-6">
            Curated <span className="italic font-light lowercase text-[#D27D5B]">Catalog</span>.
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/70 max-w-md leading-[2.2] font-sans">
            A precise, mindful selection of luxurious, sustainable products, waiting to be personalized with your unique brand asset.
          </p>
        </div>
        
        {/* Soft rounded category filter switchers */}
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] font-bold">
          <Link 
            href="/catalog" 
            className={`px-5 py-3 rounded-full transition-all duration-300 ${
              !activeCategory ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow-sm' : 'bg-[#F5F1E6]/60 border border-[#8F9C86]/20 text-[#1F2B1A]/70 hover:bg-[#1F2B1A] hover:text-[#FAF6EE]'
            }`}
          >
            All Index
          </Link>
          {['Apparel', 'Drinkware', 'Stationery', 'Tech', 'Culinary'].map((cat) => (
            <Link 
              key={cat}
              href={`/catalog?category=${cat}`} 
              className={`px-5 py-3 rounded-full transition-all duration-300 ${
                activeCategory === cat ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow-sm' : 'bg-[#F5F1E6]/60 border border-[#8F9C86]/20 text-[#1F2B1A]/70 hover:bg-[#1F2B1A] hover:text-[#FAF6EE]'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </header>

      {/* Redesigned Premium Cards Grid (At least 4 products per row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full pb-16">
        {products.length === 0 ? (
          <div className="col-span-full py-24 text-center">
            <span className="text-xs uppercase tracking-widest text-[#1F2B1A]/40 font-bold italic block">No items established under "{activeCategory}" category.</span>
          </div>
        ) : (
          products.map((product) => {
            const parsedImages = product.images ? (product.images as string[]) : [];
            const imageUrl = parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

            return (
              <Link 
                key={product.id} 
                href={`/catalog/${product.id}`} 
                className="group block bg-[#F5F1E6]/25 hover:bg-[#FAF9F5] border border-[#8F9C86]/12 hover:border-[#D27D5B] rounded-[2.2rem] p-5 transition-all duration-[0.8s] ease-out hover:-translate-y-1.5 hover:shadow-2xl shadow-sm cursor-pointer"
              >
                {/* Image Container - Double-walled with soft inner glow & zoom */}
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
                      Bespoke Craft
                    </span>
                  </div>
                </div>
                
                {/* Meta details below */}
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
          })
        )}
      </div>
    </div>
  );
}
