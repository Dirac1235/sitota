import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Truck, MapPin, Calendar, DollarSign, Package, Copy, ArrowLeft, Send } from 'lucide-react';
import CopyLinkButton from './CopyLinkButton'; // Client side helper to copy URL

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
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
          bundle: {
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        },
      },
      orderRecipients: true,
    },
  });

  if (!order) {
    notFound();
  }

  const isBundle = !!order.design.bundleId;
  const productName = isBundle ? order.design.bundle?.name || 'Custom Bundle Suite' : (order.design.product?.name || 'Custom Concept');
  const parsedImages = order.design.product?.images ? (order.design.product.images as string[]) : [];
  const defaultImageUrl = isBundle 
    ? 'https://images.unsplash.com/photo-1607344645866-eea33a4e2e27?q=80&w=1200&auto=format&fit=crop'
    : (parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600');
  
  const productImage = order.design.previewImageUrl || defaultImageUrl;

  // Deserialize individual bundle item customization parameters
  let displayPrompt = order.design.intentPrompt || '';
  let metadata: { isCohesive?: boolean; items?: Record<string, any> } | null = null;

  if (order.design.intentPrompt && order.design.intentPrompt.includes('|||JSON|||')) {
    const parts = order.design.intentPrompt.split('|||JSON|||');
    displayPrompt = parts[0].trim();
    try {
      metadata = JSON.parse(parts[1].trim());
    } catch (e) {
      console.error('Failed to parse serialized design metadata:', e);
    }
  }

  // Stats calculation
  const totalRecipients = order.orderRecipients.length;
  const awaitingCount = order.orderRecipients.filter(r => r.status === 'AWAITING_ADDRESS').length;
  const processingCount = order.orderRecipients.filter(r => r.status === 'PROCESSING' || r.status === 'PENDING').length;
  const shippedCount = order.orderRecipients.filter(r => r.status === 'SHIPPED').length;
  const deliveredCount = order.orderRecipients.filter(r => r.status === 'DELIVERED').length;

  return (
    <div className="bg-[#FAF6EE] min-h-screen pt-12 pb-24 relative overflow-hidden font-sans">
      
      {/* Mesh Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(210,125,91,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(210,125,91,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-10 animate-bloom">
        
        {/* Header Block */}
        <header className="mb-12 border-b border-[#8F9C86]/15 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" /> Return to Dashboard Portal
            </Link>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block">
              LOGISTICS STATION
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Campaign <span className="italic font-light lowercase text-[#D27D5B]">Status</span>
            </h1>
            <p className="text-xs uppercase tracking-widest font-mono text-[#1F2B1A]/40 font-bold">
              ID: {order.id} &bull; Registered on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="px-6 py-3 border border-[#8F9C86]/25 rounded-full text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A] bg-white/50 backdrop-blur-[2px] shadow-sm">
              Order Status: {order.status}
            </span>
          </div>
        </header>

        {/* Bento Overview Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-white/40 backdrop-blur-[2px] p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D27D5B]/30">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#1F2B1A]/50 block">Designees</span>
            <span className="font-serif text-4xl text-[#1F2B1A] font-bold leading-none mt-4">{totalRecipients}</span>
          </div>
          <div className="bg-white/40 backdrop-blur-[2px] p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D27D5B]/30">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#D27D5B] block">Awaiting Address</span>
            <span className="font-serif text-4xl text-[#D27D5B] font-bold leading-none mt-4">{awaitingCount}</span>
          </div>
          <div className="bg-white/40 backdrop-blur-[2px] p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D27D5B]/30">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#1F2B1A]/50 block">In Production</span>
            <span className="font-serif text-4xl text-[#1F2B1A] font-bold leading-none mt-4">{processingCount}</span>
          </div>
          <div className="bg-white/40 backdrop-blur-[2px] p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D27D5B]/30">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#1F2B1A]/50 block">Shipped Logistics</span>
            <span className="font-serif text-4xl text-[#1F2B1A] font-bold leading-none mt-4">{shippedCount}</span>
          </div>
          <div className="bg-white/40 backdrop-blur-[2px] p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8F9C86]">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#8F9C86] block">Delivered Gifts</span>
            <span className="font-serif text-4xl text-[#8F9C86] font-bold leading-none mt-4">{deliveredCount}</span>
          </div>
        </div>

        {/* Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Campaign Specs & Design Proof */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border border-[#8F9C86]/20 bg-white/40 backdrop-blur-[2px] p-8 rounded-[2rem] space-y-6 shadow-sm hover:border-[#D27D5B]/20 transition-colors duration-500">
              <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#D27D5B] block">// PRODUCTION PROOF</span>
              
              <div className="aspect-square w-full border border-[#8F9C86]/15 rounded-[1.5rem] overflow-hidden bg-white relative group shadow-inner">
                <img 
                  src={productImage} 
                  alt="Branded Concept Proof" 
                  className="w-full h-full object-cover transition-all duration-[1.5s] filter sepia-[0.03]"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-[#8F9C86]/15">
                <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 block font-sans font-bold">Product Details</span>
                <h3 className="font-serif text-3xl text-[#1F2B1A] uppercase tracking-tight leading-none">{productName}</h3>
                <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold">
                  Category: {isBundle ? 'Curated Gift Pack' : (order.design.product?.category || 'Custom')}
                </p>
              </div>

              {isBundle && order.design.bundle?.items && (
                <div className="space-y-4 pt-6 border-t border-[#8F9C86]/15">
                  <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 block font-sans font-bold">
                    Included Suite Items ({order.design.bundle.items.length}):
                  </span>
                  <div className="space-y-4 divide-y divide-[#8F9C86]/10">
                    {order.design.bundle.items.map((item) => {
                      const itemMeta = metadata?.items?.[item.productId];
                      
                      const baseImages = item.product.images ? (item.product.images as string[]) : [];
                      const itemPreview = itemMeta?.previewUrl || baseImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';
                      const itemText = itemMeta?.textLine1 || '';
                      
                      return (
                        <div key={item.id} className="pt-3 first:pt-0 flex gap-4 items-center">
                          <div className="w-12 h-14 bg-white border border-[#8F9C86]/10 rounded-xl overflow-hidden flex-shrink-0 relative group">
                            <img src={itemPreview} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <span className="font-bold text-[#1F2B1A] text-xs uppercase tracking-wider block truncate">
                              {item.product.name}
                            </span>
                            <span className="text-[10px] text-[#1F2B1A]/50 block font-mono">
                              SKU: {item.product.sku} &bull; Qty: {item.quantity}
                            </span>
                            {itemText && (
                              <span className="inline-block mt-1 text-[8px] uppercase tracking-widest font-extrabold text-[#D27D5B] bg-[#D27D5B]/5 px-2 py-0.5 rounded border border-[#D27D5B]/10">
                                Inscribed: "{itemText}"
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {displayPrompt && (
                <div className="space-y-2 pt-4 border-t border-[#8F9C86]/15">
                  <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 block font-sans font-bold">AI Prompt Configuration</span>
                  <p className="text-xs uppercase tracking-widest font-mono text-[#1F2B1A]/85 leading-relaxed bg-[#1F2B1A]/5 p-4 rounded-[1.2rem] border border-[#8F9C86]/10">
                    &ldquo;{displayPrompt}&rdquo;
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-[#8F9C86]/15 text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/60 font-mono">
                <div className="flex justify-between">
                  <span>Courier Level</span>
                  <span className="text-[#1F2B1A]">{order.deliverySpeed}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span>Investment Allocated</span>
                  <span className="font-serif text-lg text-[#1F2B1A] font-bold">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Postmark & Twilio Transactional Communication Logs */}
            <div className="border border-[#8F9C86]/20 bg-white/40 backdrop-blur-[2px] p-8 rounded-[2rem] space-y-6 shadow-sm hover:border-[#D27D5B]/20 transition-colors duration-500">
              <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#D27D5B] block flex items-center gap-1.5 font-mono">
                <Send className="w-3.5 h-3.5 text-[#D27D5B]" /> // NOTIFICATION_FEED
              </span>
              <p className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold leading-normal font-sans">
                Consolidated Postmark & Twilio streams triggered dynamically by logistics node coordinators.
              </p>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {order.orderRecipients.length === 0 ? (
                  <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono block">// No dispatches loaded.</span>
                ) : (
                  order.orderRecipients.map((rec) => {
                    const email = rec.email || 'designee@partner.com';
                    const carrier = rec.carrier || 'DHL';
                    const trk = rec.trackingNumber || 'TRK-SIM-990';

                    return (
                      <div key={rec.id} className="space-y-2 border-b border-[#8F9C86]/10 pb-3 last:border-b-0 last:pb-0">
                        <span className="text-[9px] uppercase font-extrabold text-[#1F2B1A]/40 block font-mono">
                          Rec: {rec.recipientName || 'ANONYMOUS'}
                        </span>

                        <div className="space-y-1.5 text-[9px] uppercase tracking-widest font-bold font-mono text-[#1F2B1A]/70 leading-normal">
                          <div className="flex items-start gap-1.5 text-blue-900 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100/50">
                            <span>📧</span>
                            <span className="leading-tight">[Postmark] Secure coordinates invite sent to {email}</span>
                          </div>

                          {rec.status !== 'AWAITING_ADDRESS' && (
                            <>
                              <div className="flex items-start gap-1.5 text-emerald-800 bg-green-50/40 p-2.5 rounded-lg border border-green-100/50">
                                <span>🌿</span>
                                <span className="leading-tight">[Fulfillment] Physical coordinates secured</span>
                              </div>
                              <div className="flex items-start gap-1.5 text-[#D27D5B] bg-[#D27D5B]/5 p-2.5 rounded-lg border border-[#D27D5B]/10">
                                <span>📧</span>
                                <span className="leading-tight">[Postmark] Dispatch coordinate alert sent to client portal</span>
                              </div>
                            </>
                          )}

                          {(rec.status === 'SHIPPED' || rec.status === 'DELIVERED') && (
                            <>
                              <div className="flex items-start gap-1.5 text-indigo-900 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/50">
                                <span>📱</span>
                                <span className="leading-tight">[Twilio SMS] Package in transit. Carrier: {carrier}, Trk: {trk}</span>
                              </div>
                              <div className="flex items-start gap-1.5 text-indigo-900 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/50">
                                <span>📧</span>
                                <span className="leading-tight">[Postmark] Tracking link sent to {email}</span>
                              </div>
                            </>
                          )}

                          {rec.status === 'DELIVERED' && (
                            <>
                              <div className="flex items-start gap-1.5 text-emerald-800 bg-green-50/40 p-2.5 rounded-lg border border-green-100/50">
                                <span>📱</span>
                                <span className="leading-tight">[Twilio SMS] Package successfully delivered at doorstep coordinate</span>
                              </div>
                              <div className="flex items-start gap-1.5 text-emerald-800 bg-green-50/40 p-2.5 rounded-lg border border-green-100/50">
                                <span>📧</span>
                                <span className="leading-tight">[Postmark] Delivery receipt confirmation dispatched</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Right Side: Recipients Status List */}
          <div className="lg:col-span-8 border border-[#8F9C86]/20 bg-white/40 backdrop-blur-[2px] rounded-[2rem] shadow-sm overflow-hidden hover:border-[#D27D5B]/20 transition-colors duration-500">
            <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex justify-between items-center bg-[#F5F1E6]/30">
              <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">Designee Manifest</h3>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40 font-mono">// LOGISTICS_ACTIVE</span>
            </div>

            <div className="divide-y divide-[#8F9C86]/15 bg-[#FAF6EE]/20">
              {order.orderRecipients.map((recipient) => {
                const addressObj = recipient.address as any;
                const formattedAddress = addressObj
                  ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.postalCode}, ${addressObj.country}`
                  : null;

                return (
                  <div key={recipient.id} className="p-8 hover:bg-white/50 transition-colors duration-300 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1F2B1A] flex items-center gap-2">
                          {recipient.recipientName || 'ANONYMOUS RECIPIENT'}
                          {recipient.email && <span className="text-[10px] tracking-widest text-[#1F2B1A]/40 font-normal font-sans">// {recipient.email}</span>}
                        </h4>
                        
                        {formattedAddress ? (
                          <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-medium flex items-center gap-1.5 mt-2 font-mono">
                            <MapPin className="w-4 h-4 text-[#D27D5B]" /> {formattedAddress}
                          </p>
                        ) : (
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs uppercase tracking-widest text-[#D27D5B] font-bold italic block">
                              Awaiting designee input parameters
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Tag / Controls */}
                      <div className="flex flex-col md:items-end gap-3 flex-shrink-0">
                        <span className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.25em] font-bold border rounded-full text-center ${
                          recipient.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : recipient.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : recipient.status === 'AWAITING_ADDRESS'
                            ? 'bg-[#D27D5B]/10 text-[#D27D5B] border-[#D27D5B]/20'
                            : 'bg-stone-100 text-stone-700 border-stone-300'
                        }`}>
                          {recipient.status}
                        </span>

                        {recipient.trackingNumber && (
                          <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#1F2B1A]/50">
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
