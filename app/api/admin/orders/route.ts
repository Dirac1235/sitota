import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'ORG_ADMIN')) {
      return NextResponse.json({ error: 'Admin credentials required' }, { status: 403 });
    }

    const data = await request.json();
    const { recipientId, status, carrier, trackingNumber } = data;

    if (!recipientId || !status) {
      return NextResponse.json({ error: 'Missing log variables' }, { status: 400 });
    }

    // Update recipient details
    const updatedRecipient = await prisma.orderRecipient.update({
      where: { id: recipientId },
      data: {
        status,
        carrier: carrier || null,
        trackingNumber: trackingNumber || null,
        deliveredAt: status === 'DELIVERED' ? new Date() : null
      }
    });

    // Check sibling recipients to smart update the parent order status
    const parentOrderId = updatedRecipient.orderId;
    const allRecipients = await prisma.orderRecipient.findMany({
      where: { orderId: parentOrderId }
    });

    let newOrderStatus = 'PROCESSING';

    if (allRecipients.every(r => r.status === 'DELIVERED')) {
      newOrderStatus = 'DELIVERED';
    } else if (allRecipients.some(r => r.status === 'SHIPPED')) {
      newOrderStatus = 'SHIPPED';
    } else if (allRecipients.some(r => r.status === 'AWAITING_ADDRESS')) {
      newOrderStatus = 'AWAITING_ADDRESS';
    }

    // Apply the order status update in DB
    await prisma.order.update({
      where: { id: parentOrderId },
      data: {
        status: newOrderStatus as any
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Fulfillment logging synchronized',
      recipient: updatedRecipient
    });

  } catch (error) {
    console.error('Error updating logistics:', error);
    return NextResponse.json({ error: 'Fulfillment logging exception' }, { status: 500 });
  }
}
