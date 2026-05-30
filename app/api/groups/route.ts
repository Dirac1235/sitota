import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await prisma.recipientGroup.findMany({
      where: { userId: user.id },
      include: { members: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, recipientIds } = data;

    const group = await prisma.recipientGroup.create({
      data: {
        userId: user.id,
        name,
        members: recipientIds && recipientIds.length > 0 ? {
          connect: recipientIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: { members: true }
    });

    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id } = data;

    await prisma.recipientGroup.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
