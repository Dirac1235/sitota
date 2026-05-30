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
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative animate-bloom">
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0"></div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        <header className="mb-12 border-b border-[#8F9C86]/15 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" /> Return to Client Portal
            </Link>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block">
              SYS.08 // LOGISTICS STATION
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Campaign <span className="italic font-light lowercase text-[#D27D5B]">Status</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold">
              ID: {order.id} &bull; Registered on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="px-6 py-3 border border-[#8F9C86]/20 rounded-full text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A] bg-[#F5F1E6]/40 shadow-sm">
              Order Status: {order.status}
            </span>
          </div>
        </header>

        {/* Bento Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-[#F5F1E6]/30 p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 block">Designees</span>
            <span className="font-serif text-4xl text-[#1F2B1A] font-bold leading-none mt-4">{totalRecipients}</span>
          </div>
          <div className="bg-[#F5F1E6]/30 p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D27D5B] block">Awaiting Address</span>
            <span className="font-serif text-4xl text-[#D27D5B] font-bold leading-none mt-4">{awaitingCount}</span>
          </div>
          <div className="bg-[#F5F1E6]/30 p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 block">In Production</span>
            <span className="font-serif text-4xl text-[#1F2B1A] font-bold leading-none mt-4">{processingCount}</span>
          </div>
          <div className="bg-[#F5F1E6]/30 p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 block">Shipped Logistics</span>
            <span className="font-serif text-4xl text-[#1F2B1A] font-bold leading-none mt-4">{shippedCount}</span>
          </div>
          <div className="bg-[#F5F1E6]/30 p-6 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8F9C86] block">Delivered Gifts</span>
            <span className="font-serif text-4xl text-[#8F9C86] font-bold leading-none mt-4">{deliveredCount}</span>
          </div>
        </div>

        {/* Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Campaign Specs & Design Proof */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border border-[#8F9C86]/20 bg-[#F5F1E6]/20 p-8 rounded-[2rem] space-y-6 shadow-sm">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block">01 // PRODUCTION PROOF</span>
              
              <div className="aspect-square w-full border border-[#8F9C86]/15 rounded-[1rem] overflow-hidden bg-[#FAF6EE] relative group">
                <img 
                  src={productImage} 
                  alt="Branded Concept Proof" 
                  className="w-full h-full object-cover grayscale mix-blend-multiply transition-all duration-[1.5s] group-hover:grayscale-0"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-[#8F9C86]/15">
                <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 block font-sans">Product Details</span>
                <h3 className="font-serif text-3xl text-[#1F2B1A] uppercase tracking-tight leading-none">{productName}</h3>
                <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold">Category: {order.design.product?.category || 'Custom'}</p>
              </div>

              {order.design.intentPrompt && (
                <div className="space-y-2 pt-4 border-t border-[#8F9C86]/15">
                  <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 block font-sans">AI Prompt Configuration</span>
                  <p className="text-xs uppercase tracking-widest font-mono text-[#1F2B1A]/85 leading-relaxed bg-[#1F2B1A]/5 p-4 rounded-[1.2rem] border border-[#8F9C86]/10">
                    &ldquo;{order.design.intentPrompt}&rdquo;
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-[#8F9C86]/15 text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/60">
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

            {/* Simulated Postmark & Twilio Transactional Communication Logs (Section 4.10) */}
            <div className="border border-[#8F9C86]/20 bg-[#FAF9F5] p-8 rounded-[2rem] space-y-6 shadow-sm">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block flex items-center gap-1.5 animate-pulse">
                <Send className="w-3.5 h-3.5" /> SYS.10 // NOTIFICATION STATIONS
              </span>
              <p className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold leading-normal">
                Consolidated Postmark & Twilio feeds triggered dynamically by recipient status nodes.
              </p>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {order.orderRecipients.length === 0 ? (
                  <span className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/40 font-bold block">// No notifications dispatched.</span>
                ) : (
                  order.orderRecipients.map((rec) => {
                    const email = rec.email || 'designee@partner.com';
                    const carrier = rec.carrier || 'DHL';
                    const trk = rec.trackingNumber || 'TRK-SIM-990';

                    return (
                      <div key={rec.id} className="space-y-2 border-b border-[#8F9C86]/10 pb-3 last:border-b-0 last:pb-0">
                        <span className="text-[9px] uppercase font-bold text-[#1F2B1A]/40 block font-mono">
                          Rec: {rec.recipientName || 'ANONYMOUS'}
                        </span>

                        <div className="space-y-1.5 text-[9px] uppercase tracking-widest font-bold font-mono text-[#1F2B1A]/70">
                          {/* Standard Dispatch link */}
                          <div className="flex items-start gap-1.5 text-blue-900">
                            <span>📧</span>
                            <span className="leading-tight">[Postmark] Secure Address invite link sent to {email}</span>
                          </div>

                          {/* Address filled logs */}
                          {rec.status !== 'AWAITING_ADDRESS' && (
                            <>
                              <div className="flex items-start gap-1.5 text-emerald-800">
                                <span>🌿</span>
                                <span className="leading-tight">[Fulfillment] Physical coordinates verified & secured</span>
                              </div>
                              <div className="flex items-start gap-1.5 text-[#D27D5B]">
                                <span>📧</span>
                                <span className="leading-tight">[Postmark] Campaign dispatch alert sent to Workspace</span>
                              </div>
                            </>
                          )}

                          {/* Shipped logs */}
                          {(rec.status === 'SHIPPED' || rec.status === 'DELIVERED') && (
                            <>
                              <div className="flex items-start gap-1.5 text-indigo-900">
                                <span>📱</span>
                                <span className="leading-tight">[Twilio SMS] Package in transit. Carrier: {carrier}, Trk: {trk}</span>
                              </div>
                              <div className="flex items-start gap-1.5 text-indigo-900">
                                <span>📧</span>
                                <span className="leading-tight">[Postmark] Shipping notice + tracking link sent to {email}</span>
                              </div>
                            </>
                          )}

                          {/* Delivered logs */}
                          {rec.status === 'DELIVERED' && (
                            <>
                              <div className="flex items-start gap-1.5 text-emerald-800">
                                <span>📱</span>
                                <span className="leading-tight">[Twilio SMS] Package delivered at doorstep coordinate</span>
                              </div>
                              <div className="flex items-start gap-1.5 text-emerald-800">
                                <span>📧</span>
                                <span className="leading-tight">[Postmark] Delivery receipt confirmation dispatched to Workspace</span>
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
          <div className="lg:col-span-8 border border-[#8F9C86]/20 bg-[#F5F1E6]/10 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex justify-between items-center bg-[#F5F1E6]/30">
              <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">Designee Manifest</h3>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40 font-mono">// LOGISTICS_ACTIVE</span>
            </div>

            <div className="divide-y divide-[#8F9C86]/15">
              {order.orderRecipients.map((recipient) => {
                const addressObj = recipient.address as any;
                const formattedAddress = addressObj
                  ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.postalCode}, ${addressObj.country}`
                  : null;

                return (
                  <div key={recipient.id} className="p-8 hover:bg-[#FAF6EE]/50 transition-colors duration-300 space-y-4">
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
                            ? 'bg-[#8F9C86]/10 text-[#8F9C86] border-[#8F9C86]/20'
                            : recipient.status === 'SHIPPED'
                            ? 'bg-blue-900/10 text-blue-900 border-blue-900/20'
                            : recipient.status === 'AWAITING_ADDRESS'
                            ? 'bg-[#D27D5B]/10 text-[#D27D5B] border-[#D27D5B]/20'
                            : 'bg-stone-500/10 text-stone-700 border-stone-500/20'
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
