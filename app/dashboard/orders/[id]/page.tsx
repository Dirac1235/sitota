import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Truck, MapPin, Calendar, DollarSign, Package, Copy, ArrowLeft, Send } from 'lucide-react';
import CopyLinkButton from './CopyLinkButton'; // Client side helper to copy URL

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  if (!session || !session.user || !session.user.email) {
    redirect('/login');
  }

  // Find user and order
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) {
    redirect('/login');
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: dbUser.id, // Security: ensure the user owns the order
    },
    include: {
      design: {
        include: {
          product: true,
        },
      },
      orderRecipients: true,
    },
  });

  if (!order) {
    notFound();
  }

  const productName = order.design.product?.name || 'Custom Concept';
  const parsedImages = order.design.product?.images ? (order.design.product.images as string[]) : [];
  const productImage = order.design.previewImageUrl || parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

  // Stats calculation
  const totalRecipients = order.orderRecipients.length;
  const awaitingCount = order.orderRecipients.filter(r => r.status === 'AWAITING_ADDRESS').length;
  const processingCount = order.orderRecipients.filter(r => r.status === 'PROCESSING' || r.status === 'PENDING').length;
  const shippedCount = order.orderRecipients.filter(r => r.status === 'SHIPPED').length;
  const deliveredCount = order.orderRecipients.filter(r => r.status === 'DELIVERED').length;

  return (
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative">
      <div className="w-full h-px bg-[#0A0A0A] animate-line-x absolute top-0"></div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        <header className="mb-12 border-b border-[#0A0A0A] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/60 hover:text-[#9C3D2E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" /> Return to Client Portal
            </Link>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#9C3D2E] block">
              SYS.08 // LOGISTICS STATION
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#0A0A0A] uppercase tracking-tight leading-none">
              Campaign <span className="italic font-light">Status</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#0A0A0A]/60 font-bold">
              ID: {order.id} &bull; Registered on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="px-5 py-3 border border-[#0A0A0A] text-[9px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A] bg-[#FAF9F5]/40">
              Order Status: {order.status}
            </span>
          </div>
        </header>

        {/* Bento Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-[#FAF9F5]/30 p-6 border border-[#0A0A0A] flex flex-col justify-between">
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/40 block">Designees</span>
            <span className="font-serif text-3xl text-[#0A0A0A] font-medium leading-none mt-4">{totalRecipients}</span>
          </div>
          <div className="bg-[#FAF9F5]/30 p-6 border border-[#0A0A0A] flex flex-col justify-between">
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#9C3D2E]/80 block">Awaiting Address</span>
            <span className="font-serif text-3xl text-[#9C3D2E] font-medium leading-none mt-4">{awaitingCount}</span>
          </div>
          <div className="bg-[#FAF9F5]/30 p-6 border border-[#0A0A0A] flex flex-col justify-between">
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/40 block">In Production</span>
            <span className="font-serif text-3xl text-[#0A0A0A] font-medium leading-none mt-4">{processingCount}</span>
          </div>
          <div className="bg-[#FAF9F5]/30 p-6 border border-[#0A0A0A] flex flex-col justify-between">
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A]/40 block">Shipped Logistics</span>
            <span className="font-serif text-3xl text-[#0A0A0A] font-medium leading-none mt-4">{shippedCount}</span>
          </div>
          <div className="bg-[#FAF9F5]/30 p-6 border border-[#0A0A0A] flex flex-col justify-between">
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#2C3625] block">Delivered Gifts</span>
            <span className="font-serif text-3xl text-[#2C3625] font-medium leading-none mt-4">{deliveredCount}</span>
          </div>
        </div>

        {/* Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Campaign Specs & Design Proof */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border border-[#0A0A0A] bg-[#FAF9F5]/20 p-8 space-y-6">
              <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#9C3D2E] block">01 // PRODUCTION PROOF</span>
              
              <div className="aspect-square w-full border border-[#0A0A0A]/10 overflow-hidden bg-[#EAE8E0] relative group">
                <img 
                  src={productImage} 
                  alt="Branded Concept Proof" 
                  className="w-full h-full object-cover grayscale mix-blend-multiply transition-all duration-[1.5s] group-hover:grayscale-0"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-[#0A0A0A]/10">
                <span className="text-[8px] uppercase tracking-widest text-[#0A0A0A]/40 block font-sans">Product Details</span>
                <h3 className="font-serif text-2xl text-[#0A0A0A] uppercase tracking-tight leading-none">{productName}</h3>
                <p className="text-[9px] uppercase tracking-widest text-[#0A0A0A]/60 font-bold">Category: {order.design.product?.category || 'Custom'}</p>
              </div>

              {order.design.intentPrompt && (
                <div className="space-y-2 pt-4 border-t border-[#0A0A0A]/10">
                  <span className="text-[8px] uppercase tracking-widest text-[#0A0A0A]/40 block font-sans">AI Prompt Configuration</span>
                  <p className="text-[10px] uppercase tracking-widest font-mono text-[#0A0A0A]/80 leading-relaxed bg-[#0A0A0A]/5 p-3 border border-[#0A0A0A]/10">
                    &ldquo;{order.design.intentPrompt}&rdquo;
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-[#0A0A0A]/10 text-[9px] uppercase tracking-widest font-bold text-[#0A0A0A]/60">
                <div className="flex justify-between">
                  <span>Courier Level</span>
                  <span className="text-[#0A0A0A]">{order.deliverySpeed}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span>Investment Allocated</span>
                  <span className="font-serif text-sm text-[#0A0A0A] font-bold">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Recipients Status List */}
          <div className="lg:col-span-8 border border-[#0A0A0A] bg-[#FAF9F5]/10">
            <div className="px-8 py-5 border-b border-[#0A0A0A] flex justify-between items-center bg-[#FAF9F5]/40">
              <h3 className="font-serif text-2xl text-[#0A0A0A] uppercase tracking-tight leading-none">Designee Manifest</h3>
              <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#0A0A0A]/40 font-mono">// LOGISTICS_ACTIVE</span>
            </div>

            <div className="divide-y divide-[#0A0A0A]/15">
              {order.orderRecipients.map((recipient) => {
                const addressObj = recipient.address as any;
                const formattedAddress = addressObj
                  ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.postalCode}, ${addressObj.country}`
                  : null;

                return (
                  <div key={recipient.id} className="p-8 hover:bg-[#FAF9F5]/40 transition-colors duration-300 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#0A0A0A] flex items-center gap-2">
                          {recipient.recipientName || 'ANONYMOUS RECIPIENT'}
                          {recipient.email && <span className="text-[9px] tracking-widest text-[#0A0A0A]/40 font-normal font-sans">// {recipient.email}</span>}
                        </h4>
                        
                        {formattedAddress ? (
                          <p className="text-[9px] uppercase tracking-widest text-[#0A0A0A]/60 font-medium flex items-center gap-1.5 mt-2 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-[#9C3D2E]" /> {formattedAddress}
                          </p>
                        ) : (
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[9px] uppercase tracking-widest text-[#9C3D2E] font-bold italic block">
                              Awaiting designee input parameters
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Tag / Controls */}
                      <div className="flex flex-col md:items-end gap-3 flex-shrink-0">
                        <span className={`px-3 py-1 text-[7px] uppercase tracking-[0.25em] font-bold border text-center ${
                          recipient.status === 'DELIVERED'
                            ? 'bg-[#2C3625]/10 text-[#2C3625] border-[#2C3625]/20'
                            : recipient.status === 'SHIPPED'
                            ? 'bg-blue-900/10 text-blue-900 border-blue-900/20'
                            : recipient.status === 'AWAITING_ADDRESS'
                            ? 'bg-[#9C3D2E]/10 text-[#9C3D2E] border-[#9C3D2E]/20'
                            : 'bg-stone-500/10 text-stone-700 border-stone-500/20'
                        }`}>
                          {recipient.status}
                        </span>

                        {recipient.trackingNumber && (
                          <span className="text-[8px] uppercase tracking-[0.2em] font-mono font-bold text-[#0A0A0A]/50">
                            Tracking: {recipient.trackingNumber} ({recipient.carrier || 'DHL'})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Show collection link copy trigger if address is missing */}
                    {recipient.status === 'AWAITING_ADDRESS' && (
                      <div className="pt-2">
                        <CopyLinkButton recipientId={recipient.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
