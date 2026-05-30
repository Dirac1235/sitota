'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Plus, FolderHeart, Calendar, Tag, Compass, ArrowRight, Sparkles, X, ChevronRight, Search, Copy, Award } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  images: any;
}

interface Design {
  id: string;
  productId: string | null;
  product: Product | null;
  previewImageUrl: string | null;
  status: string;
  intentPrompt: string | null;
  createdAt: string;
}

export default function DesignsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // States
  const [loading, setLoading] = useState(true);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Redirect if unauthenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/designs');
    }
  }, [sessionStatus, router]);

  // Fetch data
  const fetchData = async () => {
    try {
      const [designsRes, productsRes] = await Promise.all([
        fetch('/api/generate-preview'),
        fetch('/api/products')
      ]);

      const designsData = await designsRes.json();
      const productsData = await productsRes.json();

      if (designsRes.ok && designsData.designs) {
        setDesigns(designsData.designs);
      }
      if (productsRes.ok && productsData.products) {
        setProducts(productsData.products);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchData();
    }
  }, [sessionStatus]);

  const handleDuplicate = async (designId: string, productId: string) => {
    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duplicateId: designId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/catalog/${productId}?designId=${data.designId}`);
      }
    } catch (err) {
      console.error('Error duplicating design:', err);
    }
  };

  const handleToggleTemplate = async (designId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'APPROVED' ? 'DRAFT' : 'APPROVED';
      const res = await fetch('/api/generate-preview', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: designId, status: newStatus })
      });
      if (res.ok) {
        fetchData(); // Refresh list
      }
    } catch (err) {
      console.error('Error toggling template status:', err);
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter((prod) => {
    const term = productSearch.toLowerCase();
    return (
      prod.name.toLowerCase().includes(term) ||
      prod.category.toLowerCase().includes(term) ||
      prod.sku.toLowerCase().includes(term)
    );
  });

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EE] space-y-4">
        <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-ping"></span>
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A] animate-pulse">
          Loading Design Vault...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative animate-bloom">
      {/* Top Border Line */}
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0"></div>

      {/* Dynamic Product Selector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#1F2B1A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#FAF6EE] border border-[#8F9C86]/20 p-8 max-w-2xl w-full relative shadow-2xl rounded-[2.5rem] space-y-6 animate-fade-in flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#8F9C86]/15">
              <div>
                <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-1">
                  STATION 02 // CHOOSE BASE ELEMENT
                </span>
                <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A] leading-none">
                  Select <span className="italic font-light lowercase text-[#D27D5B]">canvas</span>
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full border border-[#8F9C86]/15 flex items-center justify-center text-[#1F2B1A]/60 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] transition-colors animate-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Search Bar */}
            <div className="relative w-full flex items-center border border-[#8F9C86]/25 px-4 py-2.5 bg-[#F5F1E6]/40 rounded-full shadow-inner">
              <Search className="w-4 h-4 text-[#1F2B1A]/40 mr-2 flex-shrink-0" />
              <input
                type="text"
                className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/30"
                placeholder="Search base products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            {/* Products List Scroll Container */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 divide-y divide-[#8F9C86]/10">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#1F2B1A]/40 font-bold tracking-widest uppercase italic">
                  No matching products found.
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const parsedImages = prod.images ? (prod.images as string[]) : [];
                  const imageUrl = parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';
                  
                  return (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setShowModal(false);
                        router.push(`/catalog/${prod.id}`);
                      }}
                      className="w-full pt-4 flex items-center gap-4 text-left group hover:opacity-80 transition-opacity"
                    >
                      <div className="w-16 h-16 bg-[#F5F1E6] rounded-xl overflow-hidden flex-shrink-0 relative border border-[#8F9C86]/10">
                        <img src={imageUrl} alt={prod.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                      </div>
                      <div className="flex-grow min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[7px] uppercase tracking-widest text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-2 py-0.5 rounded-full">
                            {prod.category}
                          </span>
                          <span className="text-[8px] uppercase tracking-widest font-mono text-[#1F2B1A]/40">
                            {prod.sku}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg text-[#1F2B1A] uppercase tracking-tight leading-none group-hover:text-[#D27D5B] transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold">
                          Base Price: ${prod.basePrice.toFixed(2)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#1F2B1A]/30 group-hover:text-[#D27D5B] transition-colors stroke-[2] flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-[8px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono pt-2 border-t border-[#8F9C86]/10">
              Active index databases // Sourced sustainable elements
            </div>

          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#8F9C86]/15 pb-8 gap-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" /> Back to Client Portal
            </Link>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block">
              SYS.02 // ARCHIVE VAULT
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Design <span className="italic font-light lowercase text-[#D27D5B]">vault</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold mt-2">
              Browse approved proofs, customize new variants, or deploy campaigns immediately.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 shadow-sm hover:shadow-md border-0 outline-none cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Initialize Design
            </button>
          </div>
        </header>

        {designs.length === 0 ? (
          <div className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 backdrop-blur-[1px] p-16 rounded-[2rem] text-center space-y-8 shadow-sm">
            <div className="w-16 h-16 bg-[#8F9C86]/10 rounded-full flex items-center justify-center mx-auto border border-[#8F9C86]/20">
              <FolderHeart className="w-6 h-6 text-[#1F2B1A]/40" />
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">Vault is currently empty</h3>
              <p className="text-xs md:text-sm font-sans text-[#1F2B1A]/60 uppercase tracking-widest leading-[2.2]">
                You have not registered any visual rendering proofs yet. Select from our sustainable base catalog, configure your specifications with our AI engine, and save proofs here.
              </p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4.5 bg-[#1F2B1A] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#D27D5B] transition-colors duration-500 shadow-sm border-0 cursor-pointer font-sans"
            >
              <Compass className="w-4 h-4" /> Browse Catalog Index
            </button>
          </div>
        ) : (
          /* Grid list of saved designs */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => {
              const productName = design.product?.name || 'Custom Branded Asset';
              const parsedImages = design.product?.images ? (design.product.images as string[]) : [];
              const imageUrl = design.previewImageUrl || parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';
              const isTemplate = design.status === 'APPROVED';

              return (
                <div 
                  key={design.id} 
                  className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 hover:bg-[#FAFEEF] hover:bg-opacity-50 rounded-[2rem] flex flex-col justify-between group overflow-hidden transition-all duration-[0.6s] hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Proof visual view */}
                  <div className="aspect-square w-full bg-[#F5F1E6] relative border-b border-[#8F9C86]/15 overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={productName} 
                      className="w-full h-full object-cover grayscale mix-blend-multiply group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-out filter sepia-[0.03]" 
                    />
                    
                    {/* Floating design ID status tag */}
                    <div className="absolute top-4 left-4 border border-[#8F9C86]/20 bg-[#FAF6EE] px-3.5 py-1.5 rounded-full text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A] shadow-sm">
                      ID: {design.id.slice(0, 8).toUpperCase()}
                    </div>

                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 border border-[#8F9C86]/20 px-3.5 py-1.5 rounded-full text-[8px] uppercase tracking-[0.2em] font-bold flex items-center gap-1 shadow-sm ${
                      isTemplate ? 'bg-[#2C3625] text-[#FAF6EE]' : 'bg-[#1F2B1A] text-[#FAF6EE]'
                    }`}>
                      {isTemplate ? (
                        <>
                          <Award className="w-3 h-3 text-[#D27D5B]" />
                          <span>Company Template</span>
                        </>
                      ) : (
                        <span>Personal Proof</span>
                      )}
                    </div>
                  </div>

                  {/* Metadata parameters */}
                  <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="inline-block text-[8px] uppercase tracking-[0.2em] text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-2.5 py-1 rounded-full">
                          SKU // {design.product?.sku || 'GENERIC'}
                        </span>
                        <h3 className="font-serif text-2xl uppercase tracking-tight text-[#1F2B1A] leading-tight">
                          {productName}
                        </h3>
                      </div>

                      {design.intentPrompt && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 block font-sans flex items-center gap-1.5 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-[#D27D5B]" /> Directive Parameters
                          </span>
                          <p className="text-[11px] uppercase tracking-widest font-sans font-medium text-[#1F2B1A]/70 line-clamp-2 leading-relaxed bg-[#F5F1E6]/50 p-3 rounded-xl border border-[#8F9C86]/10">
                            &ldquo;{design.intentPrompt}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/50 border-t border-[#8F9C86]/10 pt-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 stroke-[1.8]" />
                          <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Tag className="w-3.5 h-3.5 stroke-[1.8]" />
                          <span>${design.product?.basePrice.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Template Promotion & Duplicate Actions */}
                    <div className="flex gap-3 text-[9px] uppercase tracking-wider font-bold">
                      <button
                        onClick={() => handleDuplicate(design.id, design.productId || '')}
                        className="flex-1 py-2.5 bg-[#F5F1E6] hover:bg-[#1F2B1A] hover:text-[#FAF6EE] rounded-full flex items-center justify-center gap-1.5 text-[#1F2B1A] border border-[#8F9C86]/20 transition-all cursor-pointer font-sans"
                        title="Duplicate Design"
                      >
                        <Copy className="w-3 h-3" /> Duplicate
                      </button>
                      <button
                        onClick={() => handleToggleTemplate(design.id, design.status)}
                        className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-1.5 border transition-all cursor-pointer font-sans ${
                          isTemplate 
                            ? 'bg-[#FAF6EE] text-[#D27D5B] border-[#D27D5B]/20 hover:bg-[#D27D5B]/5' 
                            : 'bg-[#F5F1E6] text-[#1F2B1A] border-[#8F9C86]/20 hover:bg-[#2C3625] hover:text-[#FAF6EE]'
                        }`}
                        title={isTemplate ? "Demote to Personal Draft" : "Promote to Shared Company Template"}
                      >
                        <Award className="w-3 h-3" /> {isTemplate ? "Demote" : "Promote"}
                      </button>
                    </div>

                    {/* Order deployment action button */}
                    <div className="pt-4 border-t border-[#8F9C86]/15 flex gap-4">
                      <Link 
                        href={`/catalog/${design.productId}`}
                        className="flex-1 py-3 text-center border border-[#1F2B1A]/20 text-[#1F2B1A] hover:bg-[#1F2B1A] hover:text-[#FAF6EE] text-xs tracking-[0.2em] uppercase font-bold rounded-full transition-all duration-300"
                      >
                        Modify
                      </Link>
                      <Link 
                        href={`/checkout?designId=${design.id}`}
                        className="flex-1 py-3 text-center bg-[#D27D5B] text-[#FAF6EE] hover:bg-[#1F2B1A] text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 rounded-full flex items-center justify-center gap-1 shadow-sm"
                      >
                        Deploy <ArrowRight className="w-3.5 h-3.5" />
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
