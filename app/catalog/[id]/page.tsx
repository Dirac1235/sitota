import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Canvas from './Canvas';

const prisma = new PrismaClient();

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    return notFound();
  }

  return <Canvas product={product} />;
}
