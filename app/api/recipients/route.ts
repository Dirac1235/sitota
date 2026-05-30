import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

export async function POST(request: Request) {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, email, phone, address, tags } = data;

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
