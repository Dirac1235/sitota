import { PrismaClient } from '@prisma/client';
import BundlesClient from './BundlesClient';

const prisma = new PrismaClient();

export default async function BundlesPage() {
  // Fetch existing products and preset bundles to populate both flows
  const products = await prisma.product.findMany({
    orderBy: { sku: 'asc' }
  });

  const presetBundles = await prisma.bundle.findMany({
    where: { type: 'PRESET' },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { price: 'desc' }
  });

  return (
    <BundlesClient 
      products={products.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        basePrice: p.basePrice,
        description: p.description,
        images: p.images
      }))}
      presetBundles={presetBundles.map(b => ({
        id: b.id,
        name: b.name,
        price: b.price,
        items: b.items.map(i => ({
          id: i.id,
          productId: i.productId,
          productName: i.product.name,
          productImage: (i.product.images as string[])?.[0] || '',
          quantity: i.quantity,
          basePrice: i.product.basePrice
        }))
      }))}
    />
  );
}
