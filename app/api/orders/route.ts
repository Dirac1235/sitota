import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User record mismatch' }, { status: 404 });
    }

    const {
      designId,
      giftingMode, // SINGLE, BULK
      deliverySpeed,
      recipients // Array of { name, email, address }
    } = data;

    // Fetch design to calculate total (in real app, we'd look up product price)
    const design = await prisma.design.findUnique({
      where: { id: designId },
      include: { 
        product: true,
        bundle: true
      }
    });

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const unitPrice = design.bundle 
      ? design.bundle.price 
      : (design.product?.basePrice || 0);
    const totalAmount = unitPrice * recipients.length;

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        designId,
        giftingMode: giftingMode || 'SINGLE',
        totalAmount,
        deliverySpeed: deliverySpeed || 'STANDARD',
        status: 'PROCESSING', // Skips Stripe payment for demo
        orderRecipients: {
          create: recipients.map((r: any) => ({
            recipientName: r.name,
            email: r.email,
            address: r.address || null,
            status: r.address ? 'PROCESSING' : 'AWAITING_ADDRESS'
          }))
        }
      },
      include: {
        orderRecipients: true
      }
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User record mismatch' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const designId = searchParams.get('designId') || searchParams.get('id');
    
    if (designId) {
      const design = await prisma.design.findUnique({
        where: { id: designId },
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
        }
      });
      if (!design) {
        return NextResponse.json({ error: 'Design not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, design });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        design: {
          include: {
            product: true
          }
        },
        orderRecipients: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
