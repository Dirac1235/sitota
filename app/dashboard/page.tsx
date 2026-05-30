import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { Package, Users, DollarSign, Clock } from 'lucide-react';

const prisma = new PrismaClient();

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session || !session.user || !session.user.email) {
    redirect('/login');
  }

  // Get user from DB
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        include: {
          design: {
            include: {
              product: true,
            },
          },
          orderRecipients: true,
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

  const orders = dbUser.orders || [];
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  const pendingOrdersCount = orders.filter(
    (order) => order.status === 'PROCESSING' || order.status === 'AWAITING_ADDRESS'
  ).length;

  const deliveredOrdersCount = orders.filter(
    (order) => order.status === 'DELIVERED'
  ).length;

  return (
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative animate-bloom">
      
      {/* Top Line */}
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0"></div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#8F9C86]/15 pb-8 gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D27D5B] block mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full"></span>
              SYS.07 // CLIENT CONSOLE
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Client <span className="italic font-light lowercase text-[#D27D5B]">portal</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/60 font-bold mt-2">
              Overview of your registered campaigns, custom asset renders, and tracking logs.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/catalog" className="inline-flex items-center px-8 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-[9px] tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 shadow-sm border border-transparent hover:shadow-md">
              New Campaign
            </Link>
          </div>
        </header>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          <div className="bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between group hover:bg-[#FAF6EE] transition-all duration-500 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Total Campaigns</span>
              <Package className="w-4 h-4 text-[#D27D5B] stroke-[1.5]" />
            </div>
            <div className="mt-8">
              <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">{totalOrders}</span>
              <p className="text-[7px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Active log instances</p>
            </div>
          </div>

          <div className="bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between group hover:bg-[#FAF6EE] transition-all duration-500 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Capital Allocated</span>
              <DollarSign className="w-4 h-4 text-[#D27D5B] stroke-[1.5]" />
            </div>
            <div className="mt-8">
              <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">${totalSpent.toFixed(2)}</span>
              <p className="text-[7px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Total investment summary</p>
            </div>
          </div>

          <div className="bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between group hover:bg-[#FAF6EE] transition-all duration-500 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Delivered Items</span>
              <Users className="w-4 h-4 text-[#D27D5B] stroke-[1.5]" />
            </div>
            <div className="mt-8">
              <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">{deliveredOrdersCount}</span>
              <p className="text-[7px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Confirmed courier receipts</p>
            </div>
          </div>

          <div className="bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between group hover:bg-[#FAF6EE] transition-all duration-500 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">In Production</span>
              <Clock className="w-4 h-4 text-[#D27D5B] stroke-[1.5]" />
            </div>
            <div className="mt-8">
              <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">{pendingOrdersCount}</span>
              <p className="text-[7px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Active transit parameters</p>
            </div>
          </div>

        </div>

        {/* History Log Table */}
        <div className="border border-[#8F9C86]/20 bg-[#F5F1E6]/10 backdrop-blur-[1px] rounded-[2rem] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex justify-between items-center bg-[#F5F1E6]/30">
            <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">Campaign Execution Log</h3>
            <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40">// SYSTEM_RECORDS_ACTIVE</span>
          </div>
          
          {orders.length === 0 ? (
            <div className="py-24 text-center px-6">
              <p className="text-[11px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold mb-8">No campaigns initiated yet.</p>
              <Link href="/catalog" className="inline-flex justify-center items-center px-8 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-[9px] tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 shadow-sm">
                Explore Curated Index
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#8F9C86]/15">
              {orders.map((order) => {
                const productName = order.design.product?.name || 'Custom Concept';
                return (
                  <div key={order.id} className="p-8 hover:bg-[#FAF6EE]/50 transition-colors duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D27D5B] font-mono">{order.id}</span>
                        <span className="text-[7px] uppercase tracking-[0.25em] font-bold px-3 py-1 bg-[#1F2B1A] text-[#FAF6EE] border border-[#8F9C86]/10 rounded-full">
                          {order.status}
                        </span>
                      </div>
                      <h4 className="font-serif text-2xl lg:text-3xl text-[#1F2B1A] uppercase tracking-tight leading-none">{productName}</h4>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-12 text-[10px] uppercase tracking-widest font-bold text-[#1F2B1A]/60">
                      <div>
                        <span className="block text-[7px] uppercase tracking-widest text-[#1F2B1A]/40 mb-1">Recipients</span>
                        <span className="text-[#1F2B1A]">{order.orderRecipients.length} designee(s)</span>
                      </div>
                      <div>
                        <span className="block text-[7px] uppercase tracking-widest text-[#1F2B1A]/40 mb-1">Value Allocated</span>
                        <span className="font-serif text-base text-[#1F2B1A] font-bold mt-1 block">${order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-[7px] uppercase tracking-widest text-[#1F2B1A]/40 mb-1">Deployment Date</span>
                        <span className="text-[#1F2B1A] font-mono mt-1 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
