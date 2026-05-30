import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import BundleCanvas from './BundleCanvas';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function BundlePage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const bundle = await prisma.bundle.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  const allProducts = await prisma.product.findMany({
    orderBy: {
      sku: 'asc'
    }
  });

  if (!bundle) {
    notFound();
  }

  return (
    <BundleCanvas 
      bundle={{
        id: bundle.id,
        name: bundle.name,
        price: bundle.price,
        type: bundle.type,
        items: bundle.items.map(i => ({
          id: i.id,
          productId: i.productId,
          productName: i.product.name,
          productImage: (i.product.images as string[])?.[0] || '',
          quantity: i.quantity,
          basePrice: i.product.basePrice,
          category: i.product.category,
          sku: i.product.sku,
          description: i.product.description,
          isCustomizable: i.product.isCustomizable
        }))
      }} 
      allProducts={allProducts.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        basePrice: p.basePrice,
        description: p.description,
        isCustomizable: p.isCustomizable,
        images: p.images
      }))}
    />
  );
}
