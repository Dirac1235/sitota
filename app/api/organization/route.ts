import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

// GET: Retrieve the organization associated with the authenticated user
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User records mismatch' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      organization: dbUser.organization,
      role: dbUser.role,
    });

  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create or update organization parameters
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    const data = await request.json();
    const { name, brandColor, logoUrl } = data;

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    let organization;

    if (dbUser.organizationId) {
      // Update existing organization
      organization = await prisma.organization.update({
        where: { id: dbUser.organizationId },
        data: {
          name,
          brandColor: brandColor || null,
          logoUrl: logoUrl || null,
        },
      });
    } else {
      // Create new organization and connect to user
      organization = await prisma.organization.create({
        data: {
          name,
          brandColor: brandColor || '#9C3D2E',
          logoUrl: logoUrl || null,
          users: {
            connect: { id: dbUser.id },
          },
        },
      });

      // Elevate user's role to ORG_ADMIN since they founded this workspace
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          role: 'ORG_ADMIN',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Workspace settings synchronized',
      organization,
    });

  } catch (error) {
    console.error('Error saving organization settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
