import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch recipient information for the address collection page
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    const recipient = await prisma.orderRecipient.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                name: true,
                organization: {
                  select: {
                    name: true,
                    logoUrl: true,
                    brandColor: true,
                  },
                },
              },
            },
            design: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: true,
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient record not found' }, { status: 404 });
    }

    // Extract sender company name
    const senderOrgName = recipient.order.user.organization?.name || recipient.order.user.name || 'A Valued Partner';
    const brandColor = recipient.order.user.organization?.brandColor || '#9C3D2E';
    const logoUrl = recipient.order.user.organization?.logoUrl || null;
    
    // Extract product details
    const product = recipient.order.design.product;
    const parsedImages = product?.images ? (product.images as string[]) : [];
    const productImage = parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

    return NextResponse.json({
      success: true,
      recipient: {
        name: recipient.recipientName,
        email: recipient.email,
        giftMessage: recipient.giftMessage,
        status: recipient.status,
      },
      sender: {
        companyName: senderOrgName,
        brandColor,
        logoUrl,
      },
      product: {
        name: product?.name || 'Custom Branded Gift',
        category: product?.category || 'Curated Swag',
        image: productImage,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/recipients/collect-address:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Submit the recipient's shipping address
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { id, address } = data;

    if (!id || !address) {
      return NextResponse.json({ error: 'Recipient ID and Address are required' }, { status: 400 });
    }

    const { street, city, state, postalCode, country } = address;
    if (!street || !city || !state || !postalCode || !country) {
      return NextResponse.json({ error: 'Complete address details are required' }, { status: 400 });
    }

    // Find recipient
    const recipient = await prisma.orderRecipient.findUnique({
      where: { id },
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient record not found' }, { status: 404 });
    }

    // Update recipient with address and advance status
    const updatedRecipient = await prisma.orderRecipient.update({
      where: { id },
      data: {
        address: {
          street,
          city,
          state,
          postalCode,
          country,
        },
        status: 'PROCESSING',
        addressSubmittedAt: new Date(),
      },
    });

    // Smart-update parent order status:
    // If all other recipients in the order are now processed, update the order itself
    const remainingAwaiting = await prisma.orderRecipient.count({
      where: {
        orderId: recipient.orderId,
        status: 'AWAITING_ADDRESS',
      },
    });

    if (remainingAwaiting === 0) {
      await prisma.order.update({
        where: { id: recipient.orderId },
        data: {
          status: 'PROCESSING', // Elevate order status to processing since all addresses are secured
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Address securely logged',
      recipient: updatedRecipient,
    });

  } catch (error) {
    console.error('Error in POST /api/recipients/collect-address:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
