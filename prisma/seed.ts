import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning existing database entries...');
  
  // Clear tables in the correct dependency order
  await prisma.orderRecipient.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.design.deleteMany({});
  await prisma.bundleItem.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.product.deleteMany({});

  console.log('Seeding products...');

  const productsData = [
    {
      sku: 'DRK-001',
      name: 'Premium Ceramic Mug',
      category: 'Drinkware',
      description: 'A beautifully crafted, double-walled ceramic mug that preserves heat while keeping the exterior perfectly cool to touch. Features a sleek matte finish.',
      basePrice: 15.0,
      images: [
        'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Front Center', max_width: 80, max_height: 80 }
      ]
    },
    {
      sku: 'AP-002',
      name: 'Cashmere Blend Hoodie',
      category: 'Apparel',
      description: 'The epitome of soft, sustainable luxury. Made from a fine blend of extra-fine organic cotton and ethical Mongolian cashmere.',
      basePrice: 85.0,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Left Chest', max_width: 40, max_height: 40 },
        { name: 'Center Chest', max_width: 120, max_height: 120 }
      ]
    },
    {
      sku: 'ST-003',
      name: 'Hand-Stitched Leather Notebook',
      category: 'Stationery',
      description: 'Constructed from full-grain vegetable-tanned Italian leather with hand-sewn spine details. Contains 160 pages of heavy, cream acid-free paper.',
      basePrice: 45.0,
      images: [
        'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Bottom Right Deboss', max_width: 50, max_height: 20 },
        { name: 'Center Deboss', max_width: 80, max_height: 80 }
      ]
    },
    {
      sku: 'TC-004',
      name: 'Minimalist Wireless Charger',
      category: 'Tech',
      description: 'A multi-device wireless fast charger housed in raw walnut wood and brushed aircraft-grade aluminum. Understated premium workspace utility.',
      basePrice: 55.0,
      images: [
        'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Center Laser Etch', max_width: 50, max_height: 50 }
      ]
    },
    {
      sku: 'CUL-005',
      name: 'Artisan Coffee Set',
      category: 'Culinary',
      description: 'A curated tasting experience featuring a copper dripper, hand-blown glass server, and two single-origin micro-lot coffee bags sourced from Ethiopia.',
      basePrice: 65.0,
      images: [
        'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Box Center Deboss', max_width: 100, max_height: 40 }
      ]
    },
    {
      sku: 'ST-006',
      name: 'Matte Black Rollerball Pen',
      category: 'Stationery',
      description: 'Balanced brass body coated in a velvety matte-black lacquer. Equipped with a Swiss-made ceramic rollerball refill for flawless ink flow.',
      basePrice: 25.0,
      images: [
        'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Cap Laser Engrave', max_width: 40, max_height: 8 }
      ]
    }
  ];

  const products: any[] = [];
  for (const prod of productsData) {
    const createdProduct = await prisma.product.create({
      data: {
        sku: prod.sku,
        name: prod.name,
        category: prod.category,
        description: prod.description,
        basePrice: prod.basePrice,
        images: prod.images,
        placementZones: prod.placementZones
      }
    });
    products.push(createdProduct);
  }

  console.log(`Seeded ${products.length} products.`);

  // Find product helper
  const getProductBySku = (sku: string) => products.find(p => p.sku === sku);

  console.log('Seeding pre-made bundles...');

  const presetBundlesData = [
    {
      name: 'New Hire Welcome Kit',
      price: 135.0,
      items: [
        { sku: 'AP-002', quantity: 1 }, // Hoodie
        { sku: 'ST-003', quantity: 1 }, // Notebook
        { sku: 'DRK-001', quantity: 1 } // Mug
      ]
    },
    {
      name: 'Executive Writer Set',
      price: 65.0,
      items: [
        { sku: 'ST-003', quantity: 1 }, // Notebook
        { sku: 'ST-006', quantity: 1 }  // Pen
      ]
    },
    {
      name: 'Modern Tech Workspace Pack',
      price: 115.0,
      items: [
        { sku: 'TC-004', quantity: 1 }, // Wireless Charger
        { sku: 'DRK-001', quantity: 1 }, // Mug
        { sku: 'ST-006', quantity: 1 }  // Pen
      ]
    }
  ];

  for (const bundle of presetBundlesData) {
    const createdBundle = await prisma.bundle.create({
      data: {
        name: bundle.name,
        price: bundle.price,
        type: 'PRESET'
      }
    });

    for (const item of bundle.items) {
      const product = getProductBySku(item.sku);
      if (product) {
        await prisma.bundleItem.create({
          data: {
            bundleId: createdBundle.id,
            productId: product.id,
            quantity: item.quantity
          }
        });
      }
    }
  }

  console.log('Seeded preset bundles successfully.');
  console.log('Seeding complete! Curated catalog and bundle items are fully established.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
