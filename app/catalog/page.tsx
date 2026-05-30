import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Catalog() {
  const products = await prisma.product.findMany({
    orderBy: {
      sku: 'asc'
    }
  });

  return (
    <div className="w-full relative min-h-screen px-6 lg:px-12 py-8 space-y-12 animate-bloom">

      {/* Warm Header Section */}
      <header className="p-8 lg:p-14 bg-[#F5F1E6]/40 backdrop-blur-[2px] rounded-[2.5rem] border border-[#8F9C86]/15 flex flex-col lg:flex-row lg:items-end justify-between shadow-sm gap-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full"></span>
            Vol. 02 — Product Index
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-[#1F2B1A] leading-none uppercase tracking-tighter mb-6">
            Curated <span className="italic font-light lowercase text-[#D27D5B]">Catalog</span>.
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.15em] text-[#1F2B1A]/70 max-w-md leading-[2.2] font-sans">
            A precise, mindful selection of luxurious, sustainable products, waiting to be personalized with your unique brand asset.
          </p>
        </div>
        
        {/* Soft rounded filter tags */}
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] font-bold">
          <button className="px-5 py-3 rounded-full bg-[#1F2B1A] text-[#FAF6EE] shadow-sm">All Index</button>
          <button className="px-5 py-3 rounded-full bg-[#F5F1E6]/60 border border-[#8F9C86]/20 text-[#1F2B1A]/70 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] transition-colors duration-300">Apparel</button>
          <button className="px-5 py-3 rounded-full bg-[#F5F1E6]/60 border border-[#8F9C86]/20 text-[#1F2B1A]/70 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] transition-colors duration-300">Drinkware</button>
          <button className="px-5 py-3 rounded-full bg-[#F5F1E6]/60 border border-[#8F9C86]/20 text-[#1F2B1A]/70 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] transition-colors duration-300">Hardware</button>
        </div>
      </header>

      {/* Catalog discovery sub-navigation */}
      <div className="flex gap-8 border-b border-[#8F9C86]/10 pb-4 text-xs uppercase tracking-[0.25em] font-bold">
        <Link href="/catalog" className="text-[#1F2B1A] border-b-2 border-[#1F2B1A] pb-4 -mb-[18px]">
          Individual Products
        </Link>
        <Link href="/catalog/bundles" className="text-[#1F2B1A]/40 hover:text-[#1F2B1A] pb-4 transition-colors">
          Curated Bundles & Packs
        </Link>
      </div>
      
      {/* Soft Rounded Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full pb-16">
        {products.map((product, index) => {
          const parsedImages = product.images ? (product.images as string[]) : [];
          const imageUrl = parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

          return (
            <Link 
              key={product.id} 
              href={`/catalog/${product.id}`} 
              className="group block bg-[#F5F1E6]/30 hover:bg-[#FAF6EE] border border-[#8F9C86]/15 rounded-[2rem] p-4 transition-all duration-[0.8s] ease-out hover:-translate-y-1 hover:shadow-xl shadow-sm"
            >
              {/* Image Container with Soft Rounded Edges */}
              <div className="relative aspect-square overflow-hidden bg-[#F5F1E6] rounded-[1.5rem] mb-6 shadow-inner">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover object-center scale-102 group-hover:scale-105 transition-all duration-[2s] ease-out mix-blend-multiply opacity-95 group-hover:opacity-100 filter sepia-[0.05]"
                />
                
                {/* SKU Badge - Soft Pill */}
                <div className="absolute top-4 left-4 border border-[#8F9C86]/20 bg-[#FAF6EE] px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A] shadow-sm">
                  {product.sku}
                </div>

                {/* Hover Reveal CTA - Rounded Badge */}
                <div className="absolute inset-0 bg-[#1F2B1A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="bg-[#FAF6EE] text-[#1F2B1A] border border-[#8F9C86]/20 text-xs uppercase tracking-[0.25em] px-8 py-4 font-bold rounded-full shadow-md translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                    Bespoke Craft
                  </span>
                </div>
              </div>
              
              {/* Product Meta inside the card */}
              <div className="px-3 pb-2 flex justify-between items-end gap-4">
                <div className="space-y-2">
                  <span className="inline-block text-xs uppercase tracking-[0.2em] text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-3 py-1.5 rounded-full">
                    {product.category}
                  </span>
                  <h3 className="font-serif text-2xl lg:text-3xl tracking-tight text-[#1F2B1A]">
                    {product.name}
                  </h3>
                </div>
                <div className="text-right pb-1">
                  <p className="text-xs md:text-sm font-sans tracking-[0.1em] uppercase font-bold text-[#1F2B1A]/80">
                    ${product.basePrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
