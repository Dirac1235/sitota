import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET: Retrieve the address book recipients for the logged-in user
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
      return NextResponse.json({ error: 'User records mismatch' }, { status: 404 });
    }

    const recipients = await prisma.recipient.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ recipients });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
  }
}

// POST: Create a new recipient contact in the logged-in user's private directory
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User records mismatch' }, { status: 404 });
    }

    const data = await request.json();
    const { name, email, phone, address, tags } = data;

    if (!name) {
      return NextResponse.json({ error: 'Recipient name is required' }, { status: 400 });
    }

    const recipient = await prisma.recipient.create({
      data: {
        userId: user.id,
        name,
        email,
        phone,
        address: address || {},
        tags: tags || []
      }
    });

    return NextResponse.json({ success: true, recipient }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating recipient:', error);
    return NextResponse.json({ error: 'Failed to create recipient' }, { status: 500 });
  }
}
