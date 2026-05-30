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
    <div className="bg-[#FDFBF7] min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <header className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between border-b border-[#1c1c1c]/10 pb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#1c1c1c] mb-4">The Collection</h1>
            <p className="text-sm font-light text-[#1c1c1c]/60 max-w-md">
              A curated selection of exceptional items, ready to be personalized with your brand's unique identity.
            </p>
          </div>
          <div className="mt-8 md:mt-0 flex gap-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1c1c1c]/40">
            <button className="text-[#1c1c1c] border-b border-[#1c1c1c] pb-1">All</button>
            <button className="hover:text-[#1c1c1c] transition-colors pb-1">Apparel</button>
            <button className="hover:text-[#1c1c1c] transition-colors pb-1">Drinkware</button>
            <button className="hover:text-[#1c1c1c] transition-colors pb-1">Tech</button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {products.map((product) => {
            const parsedImages = product.images ? (product.images as string[]) : [];
            const imageUrl = parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

            return (
              <Link key={product.id} href={`/catalog/${product.id}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#f0eee9] mb-6">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out flex justify-center">
                    <span className="bg-[#1c1c1c] text-[#FDFBF7] text-[10px] uppercase tracking-[0.2em] px-6 py-3 font-semibold">
                      Customize
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1c1c]/50 font-semibold mb-2">{product.category}</p>
                  <h3 className="font-serif text-lg text-[#1c1c1c] mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm font-light text-[#1c1c1c]/70">${product.basePrice.toFixed(2)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
