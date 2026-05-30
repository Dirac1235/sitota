import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft, Plus, FolderHeart, Calendar, Tag, Compass, ArrowRight, Sparkles } from 'lucide-react';

const prisma = new PrismaClient();

export default async function DesignsPage() {
  const session = await getServerSession();

  if (!session || !session.user || !session.user.email) {
    redirect('/login');
  }

  // Get user from DB
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      designs: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!dbUser) {
    redirect('/login');
  }

  const designs = dbUser.designs || [];

  return (
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative">
      <div className="w-full h-px bg-[#0A0A0A] animate-line-x absolute top-0"></div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#0A0A0A] pb-8 gap-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/60 hover:text-[#9C3D2E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" /> Back to Client Portal
            </Link>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#9C3D2E] block">
              SYS.02 // ARCHIVE STUDIO
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#0A0A0A] uppercase tracking-tight leading-none">
              Design <span className="italic font-light">Vault</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/60 font-bold mt-2">
              Browse approved proofs, customize new variants, or deploy campaigns immediately.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/catalog" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0A0A0A] text-[#EAE8E0] text-[9px] tracking-[0.25em] uppercase font-bold hover:bg-[#9C3D2E] transition-colors duration-500 border border-[#0A0A0A]">
              <Plus className="w-4 h-4 stroke-[2]" /> Initialize Configuration
            </Link>
          </div>
        </header>

        {designs.length === 0 ? (
          <div className="border border-[#0A0A0A] bg-[#FAF9F5]/20 backdrop-blur-[1px] p-16 text-center space-y-8">
            <div className="w-16 h-16 bg-[#0A0A0A]/5 rounded-full flex items-center justify-center mx-auto border border-[#0A0A0A]/10">
              <FolderHeart className="w-6 h-6 text-[#0A0A0A]/30" />
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <h3 className="font-serif text-2xl uppercase tracking-tight text-[#0A0A0A]">Vault is currently empty</h3>
              <p className="text-[11px] font-sans text-[#0A0A0A]/60 uppercase tracking-widest leading-[2]">
                You have not registered any visual rendering proofs. Head over to our curated product index, configure your specs with our AI engine, and save proofs here.
              </p>
            </div>
            <Link 
              href="/catalog" 
              className="inline-flex items-center gap-2 px-8 py-4.5 bg-[#0A0A0A] text-[#EAE8E0] text-[9px] tracking-[0.25em] uppercase font-bold hover:bg-[#9C3D2E] transition-colors duration-500"
            >
              <Compass className="w-4 h-4" /> Browse Catalog Index
            </Link>
          </div>
        ) : (
          /* Grid list of saved designs */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => {
              const productName = design.product?.name || 'Custom Branded Asset';
              const parsedImages = design.product?.images ? (design.product.images as string[]) : [];
              const imageUrl = design.previewImageUrl || parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

              return (
                <div 
                  key={design.id} 
                  className="border border-[#0A0A0A] bg-[#FAF9F5]/10 flex flex-col justify-between group overflow-hidden"
                >
                  {/* Proof visual view */}
                  <div className="aspect-square w-full bg-[#EAE8E0] relative border-b border-[#0A0A0A] overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={productName} 
                      className="w-full h-full object-cover grayscale mix-blend-multiply group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-out" 
                    />
                    
                    {/* Floating design ID status tag */}
                    <div className="absolute top-4 left-4 border border-[#0A0A0A] bg-[#EAE8E0] px-3 py-1 text-[7px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]">
                      ID: {design.id}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 border border-[#0A0A0A] bg-[#2C3625] text-[#EAE8E0] px-3 py-1 text-[7px] uppercase tracking-[0.25em] font-bold">
                      {design.status}
                    </div>
                  </div>

                  {/* Metadata parameters */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[7px] uppercase tracking-[0.25em] font-bold text-[#9C3D2E] block">
                          SKU // {design.product?.sku || 'GENERIC'}
                        </span>
                        <h3 className="font-serif text-2xl uppercase tracking-tight text-[#0A0A0A] leading-none">
                          {productName}
                        </h3>
                      </div>

                      {design.intentPrompt && (
                        <div className="space-y-1">
                          <span className="text-[7px] uppercase tracking-widest text-[#0A0A0A]/40 block font-sans flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#9C3D2E]" /> Directive Prompt Parameters
                          </span>
                          <p className="text-[9px] uppercase tracking-widest font-mono text-[#0A0A0A]/70 line-clamp-2 leading-relaxed bg-[#0A0A0A]/5 p-2.5 border border-[#0A0A0A]/5">
                            &ldquo;{design.intentPrompt}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-[8px] uppercase tracking-widest font-bold text-[#0A0A0A]/50 border-t border-[#0A0A0A]/10 pt-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Tag className="w-3.5 h-3.5" />
                          <span>${design.product?.basePrice.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order deployment action button */}
                    <div className="pt-4 border-t border-[#0A0A0A]/15 flex gap-3">
                      <Link 
                        href={`/catalog/${design.productId}`}
                        className="flex-1 py-3 text-center border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#EAE8E0] text-[8px] tracking-[0.2em] uppercase font-bold transition-colors duration-300"
                      >
                        Modify Specs
                      </Link>
                      <Link 
                        href={`/checkout?designId=${design.id}`}
                        className="flex-1 py-3 text-center bg-[#0A0A0A] hover:bg-[#9C3D2E] text-[#EAE8E0] text-[8px] tracking-[0.2em] uppercase font-bold transition-colors duration-300 border border-[#0A0A0A] flex items-center justify-center gap-1"
                      >
                        Deploy Campaign <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
