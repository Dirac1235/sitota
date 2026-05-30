import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId: string | null = null;

    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (dbUser) {
        userId = dbUser.id;
      }
    }

    const data = await request.json();
    const { name, price, items } = data;

    if (!name || !price || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing bundle composition variables' }, { status: 400 });
    }

    // Create the custom bundle
    const bundle = await prisma.bundle.create({
      data: {
        name,
        price: parseFloat(price),
        type: 'CUSTOM',
        createdBy: userId || 'GUEST',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Custom bundle parameters recorded',
      bundleId: bundle.id
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating custom bundle:', error);
    return NextResponse.json({ error: 'Failed to record custom bundle' }, { status: 500 });
  }
}
