import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real app, authenticate user
    let user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      include: { product: true }
    });

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const unitPrice = design.product?.basePrice || 0;
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
    const orders = await prisma.order.findMany({
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
