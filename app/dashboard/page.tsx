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
    <div className="bg-[#FDFBF7] min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <header className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#1c1c1c]/10 pb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-[#1c1c1c] mb-4">Dashboard</h1>
            <p className="text-sm font-light text-[#1c1c1c]/60 max-w-md">
              Overview of your active campaigns, luxury items designed, and tracking logs.
            </p>
          </div>
          <div className="mt-8 md:mt-0 flex gap-4">
            <Link href="/catalog" className="px-6 py-3 bg-[#1c1c1c] text-[#FDFBF7] text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#333] transition-colors duration-500">
              New Campaign
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-8 border border-[#1c1c1c]/10 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Package className="w-5 h-5 text-[#8B7355] stroke-[1.2]" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#1c1c1c]/50">Total Orders</span>
            </div>
            <span className="font-serif text-3xl text-[#1c1c1c]">{totalOrders}</span>
          </div>

          <div className="bg-white p-8 border border-[#1c1c1c]/10 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <DollarSign className="w-5 h-5 text-[#8B7355] stroke-[1.2]" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#1c1c1c]/50">Total Invested</span>
            </div>
            <span className="font-serif text-3xl text-[#1c1c1c]">${totalSpent.toFixed(2)}</span>
          </div>

          <div className="bg-white p-8 border border-[#1c1c1c]/10 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-5 h-5 text-[#8B7355] stroke-[1.2]" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#1c1c1c]/50">Gifts Delivered</span>
            </div>
            <span className="font-serif text-3xl text-[#1c1c1c]">{deliveredOrdersCount}</span>
          </div>

          <div className="bg-white p-8 border border-[#1c1c1c]/10 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Clock className="w-5 h-5 text-[#8B7355] stroke-[1.2]" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#1c1c1c]/50">Campaigns Active</span>
            </div>
            <span className="font-serif text-3xl text-[#1c1c1c]">{pendingOrdersCount}</span>
          </div>
        </div>

        {/* History Table / List */}
        <div className="bg-white border border-[#1c1c1c]/10 shadow-sm">
          <div className="px-8 py-6 border-b border-[#1c1c1c]/10">
            <h3 className="font-serif text-xl text-[#1c1c1c]">Order History</h3>
          </div>
          {orders.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm font-light text-[#1c1c1c]/40 mb-6">No campaigns initiated yet.</p>
              <Link href="/catalog" className="inline-block px-6 py-3 border border-[#1c1c1c] text-xs tracking-wider uppercase font-semibold text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white transition-all duration-300">
                Browse Curated Products
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#1c1c1c]/5">
              {orders.map((order) => {
                const productName = order.design.product?.name || 'Custom Concept';
                return (
                  <li key={order.id} className="p-8 hover:bg-[#FAF8F5] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-4 mb-1">
                          <span className="text-xs uppercase tracking-wider font-bold text-[#8B7355]">{order.id}</span>
                          <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 bg-gray-100 text-gray-800">
                            {order.status}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg text-[#1c1c1c]">{productName}</h4>
                      </div>
                      <div className="flex items-center gap-12 text-sm text-[#1c1c1c]/60 font-light">
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider font-bold text-[#1c1c1c]/40 mb-1">Recipients</span>
                          <span>{order.orderRecipients.length} Recipient(s)</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider font-bold text-[#1c1c1c]/40 mb-1">Amount</span>
                          <span className="font-serif text-[#1c1c1c] font-medium">${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider font-bold text-[#1c1c1c]/40 mb-1">Date</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
