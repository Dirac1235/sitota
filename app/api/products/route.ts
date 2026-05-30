import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  try {
    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate auth and role (Super Admin only in real app)
    
    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        category: data.category,
        description: data.description,
        basePrice: data.basePrice,
        isCustomizable: data.isCustomizable ?? true,
        placementZones: data.placementZones ?? [],
        images: data.images ?? []
      }
    });
    
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
