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
    },
    {
      sku: 'AP-007',
      name: 'Organic Linen Tote Bag',
      category: 'Apparel',
      description: 'A durable, raw organic linen tote with reinforced cotton canvas webbing straps and spacious internal pockets. Perfect for everyday carrying.',
      basePrice: 35.0,
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Front Center Print', max_width: 120, max_height: 120 }
      ]
    },
    {
      sku: 'ST-008',
      name: 'Solid Brushed Brass Ruler',
      category: 'Stationery',
      description: 'Solid heavy-gauge brass desk ruler with laser-etched metric and imperial increments. Develops a gorgeous warm patina over time.',
      basePrice: 18.0,
      images: [
        'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Center Engrave', max_width: 50, max_height: 10 }
      ]
    },
    {
      sku: 'DRK-009',
      name: 'Double-Walled Glass Tumbler',
      category: 'Drinkware',
      description: 'Hand-blown borosilicate glass tumbler with double-wall insulation, preserving beverage temperatures cleanly with a floating visual effect.',
      basePrice: 22.0,
      images: [
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Front Etch', max_width: 60, max_height: 60 }
      ]
    },
    {
      sku: 'TC-010',
      name: 'Leather Desk Charging Mat',
      category: 'Tech',
      description: 'Full-grain vegetable-tanned leather desk blotter integrated with a 15W high-speed wireless charging zone and brushed gold trim.',
      basePrice: 95.0,
      images: [
        'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Bottom Right Deboss', max_width: 50, max_height: 20 }
      ]
    },
    {
      sku: 'CUL-011',
      name: 'Single-Origin Honey Jar',
      category: 'Culinary',
      description: 'Raw, unpasteurized white honey harvested sustainably from organic wildflower meadows, packaged in a custom heavy glass jar.',
      basePrice: 28.0,
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Label Print', max_width: 40, max_height: 40 }
      ]
    },
    {
      sku: 'CUL-012',
      name: 'Cedarwood Soy Wax Candle',
      category: 'Culinary',
      description: 'Hand-poured candle made from sustainable domestic soy wax and natural essential oils of red cedarwood, frankincense, and dark amber.',
      basePrice: 32.0,
      images: [
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Glass Label Print', max_width: 50, max_height: 50 }
      ]
    },
    {
      sku: 'DRK-013',
      name: 'Insulated Stainless Steel Bottle',
      category: 'Drinkware',
      description: 'Triple-insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12. Matte finish with a leak-proof loop cap.',
      basePrice: 38.0,
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Front Laser Etch', max_width: 60, max_height: 100 }
      ]
    },
    {
      sku: 'DRK-014',
      name: 'Ceramic Espresso Cup Set',
      category: 'Drinkware',
      description: 'A set of two hand-thrown ceramic espresso cups with a rustic glaze and raw sand-textured bottom. Stackable space-saving design.',
      basePrice: 28.0,
      images: [
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Side Etch', max_width: 30, max_height: 30 }
      ]
    },
    {
      sku: 'AP-015',
      name: 'Premium Merino Wool Socks',
      category: 'Apparel',
      description: 'Ultra-soft, breathable socks made from fine New Zealand Merino wool with cushioned soles and reinforced heels for maximum comfort.',
      basePrice: 16.0,
      images: [
        'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Ankle Embroidery', max_width: 30, max_height: 30 }
      ]
    },
    {
      sku: 'AP-016',
      name: 'Recycled Cotton Crewneck Sweatshirt',
      category: 'Apparel',
      description: 'Classic fit crewneck sweatshirt crafted from 100% recycled cotton. Heavyweight fabric with soft brushed interior lining.',
      basePrice: 65.0,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Left Chest', max_width: 40, max_height: 40 },
        { name: 'Center Print', max_width: 150, max_height: 100 }
      ]
    },
    {
      sku: 'AP-017',
      name: 'Brushed Twill Baseball Cap',
      category: 'Apparel',
      description: 'Unstructured six-panel cap made from brushed organic cotton twill with an adjustable brass buckle closure.',
      basePrice: 24.0,
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Front Center Embroidery', max_width: 60, max_height: 40 }
      ]
    },
    {
      sku: 'ST-018',
      name: 'Brass Fountain Pen',
      category: 'Stationery',
      description: 'Precision-machined raw brass fountain pen with a medium German-made steel nib. Perfectly weighted for a lifetime of smooth writing.',
      basePrice: 75.0,
      images: [
        'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Body Laser Engrave', max_width: 35, max_height: 6 }
      ]
    },
    {
      sku: 'ST-019',
      name: 'Refillable Sketchbook Kit',
      category: 'Stationery',
      description: 'Waxed canvas outer wrap housing a heavy-weight cartridge notebook. Features interior loops for pencils and utility cards.',
      basePrice: 32.0,
      images: [
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Front Cover Print', max_width: 60, max_height: 60 }
      ]
    },
    {
      sku: 'ST-020',
      name: 'Hardcover Desktop Planner',
      category: 'Stationery',
      description: 'Undated weekly planner with thick layout pages, flat-lay binding, and ribbon markers. Wrapped in durable book cloth fabric.',
      basePrice: 28.0,
      images: [
        'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Front Cover Deboss', max_width: 80, max_height: 40 }
      ]
    },
    {
      sku: 'TC-021',
      name: 'Wooden Mechanical Keyboard',
      category: 'Tech',
      description: 'Compact 60% mechanical keyboard with tactile brown switches, Bluetooth connectivity, and a solid premium solid walnut wooden case.',
      basePrice: 145.0,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Bottom Wooden Engrave', max_width: 80, max_height: 30 }
      ]
    },
    {
      sku: 'TC-022',
      name: 'Leather Travel Cable Organizer',
      category: 'Tech',
      description: 'Genuine leather roll-up pouch with flexible loops and mesh pockets to secure chargers, cables, and ear buds while on the move.',
      basePrice: 34.0,
      images: [
        'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Strap Deboss', max_width: 40, max_height: 15 }
      ]
    },
    {
      sku: 'TC-023',
      name: 'Minimalist Aluminum Laptop Stand',
      category: 'Tech',
      description: 'Ergonomic sandblasted aluminum laptop stand designed to match clean office aesthetics. Optimizes airflow and screen height.',
      basePrice: 48.0,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Base Laser Etch', max_width: 40, max_height: 20 }
      ]
    },
    {
      sku: 'CUL-024',
      name: 'Organic Loose Leaf Tea Sampler',
      category: 'Culinary',
      description: 'An elegant glass-vial gift set containing organic Earl Grey, Moroccan Mint, Jasmine Green, and herbal Chamomile loose leaf teas.',
      basePrice: 35.0,
      images: [
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Wood Box Top Print', max_width: 80, max_height: 40 }
      ]
    },
    {
      sku: 'CUL-025',
      name: 'Gourmet Chocolate Bar Gift Box',
      category: 'Culinary',
      description: 'A curated selection of 4 bean-to-bar dark chocolates infused with sea salt, espresso, lavender, and orange peel from organic cacao estates.',
      basePrice: 42.0,
      images: [
        'https://images.unsplash.com/photo-1548907040-4d42b52145ca?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Paper Sleeve Print', max_width: 100, max_height: 50 }
      ]
    },
    {
      sku: 'CUL-026',
      name: 'Infused Olive Oil & Vinegar Set',
      category: 'Culinary',
      description: 'Cold-pressed extra virgin olive oil infused with organic rosemary, alongside aged dark balsamic vinegar of Modena in beautiful glass cruets.',
      basePrice: 48.0,
      images: [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Glass Cruet Etch', max_width: 30, max_height: 50 }
      ]
    },
    {
      sku: 'HL-027',
      name: 'Recycled Wool Throw Blanket',
      category: 'Home & Lifestyle',
      description: 'Warm, soft, and durable blanket made of recycled Italian wool. Features a classic neutral herringbone pattern with fringed edges.',
      basePrice: 95.0,
      images: [
        'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Leather Patch Deboss', max_width: 40, max_height: 25 }
      ]
    },
    {
      sku: 'HL-028',
      name: 'Terrazzo Stone Coaster Set',
      category: 'Home & Lifestyle',
      description: 'A set of four heavy terrazzo stone coasters with cork backing to protect surfaces, showcasing beautiful multi-colored marble chips.',
      basePrice: 30.0,
      images: [
        'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Coaster Rim Etch', max_width: 25, max_height: 10 }
      ]
    },
    {
      sku: 'HL-029',
      name: 'Concrete Succulent Planter Set',
      category: 'Home & Lifestyle',
      description: 'Three geometric mini concrete planters featuring drainage holes and matching trays, perfect for displaying small succulents or herbs.',
      basePrice: 26.0,
      images: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600'
      ],
      placementZones: [
        { name: 'Planter Side Print', max_width: 30, max_height: 30 }
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
    },
    {
      name: 'Morning Brew Ritual',
      price: 110.0,
      items: [
        { sku: 'CUL-005', quantity: 1 }, // Artisan Coffee Set
        { sku: 'DRK-001', quantity: 1 }, // Mug
        { sku: 'DRK-014', quantity: 1 }  // Ceramic Espresso Cup Set
      ]
    },
    {
      name: 'Cozy Winter Pack',
      price: 175.0,
      items: [
        { sku: 'AP-002', quantity: 1 },  // Cashmere Blend Hoodie
        { sku: 'HL-027', quantity: 1 },  // Recycled Wool Throw Blanket
        { sku: 'CUL-012', quantity: 1 }  // Cedarwood Soy Wax Candle
      ]
    },
    {
      name: 'Executive Office Deluxe',
      price: 215.0,
      items: [
        { sku: 'TC-010', quantity: 1 },  // Leather Desk Charging Mat
        { sku: 'ST-018', quantity: 1 },  // Brass Fountain Pen
        { sku: 'ST-003', quantity: 1 }   // Hand-Stitched Leather Notebook
      ]
    },
    {
      name: 'Travelers Tech & Gear',
      price: 90.0,
      items: [
        { sku: 'DRK-013', quantity: 1 }, // Insulated Stainless Steel Bottle
        { sku: 'TC-022', quantity: 1 },  // Leather Travel Cable Organizer
        { sku: 'AP-017', quantity: 1 }   // Brushed Twill Baseball Cap
      ]
    },
    {
      name: 'Gourmet Tasting Experience',
      price: 98.0,
      items: [
        { sku: 'CUL-024', quantity: 1 }, // Organic Loose Leaf Tea Sampler
        { sku: 'CUL-025', quantity: 1 }, // Gourmet Chocolate Bar Gift Box
        { sku: 'CUL-011', quantity: 1 }  // Single-Origin Honey Jar
      ]
    },
    {
      name: 'Eco-Friendly Daily Kit',
      price: 105.0,
      items: [
        { sku: 'AP-016', quantity: 1 },  // Recycled Cotton Crewneck Sweatshirt
        { sku: 'AP-007', quantity: 1 },  // Organic Linen Tote Bag
        { sku: 'AP-015', quantity: 1 }   // Premium Merino Wool Socks
      ]
    },
    {
      name: 'Designer Desktop Essentials',
      price: 100.0,
      items: [
        { sku: 'ST-008', quantity: 1 },  // Solid Brushed Brass Ruler
        { sku: 'HL-028', quantity: 1 },  // Terrazzo Stone Coaster Set
        { sku: 'ST-020', quantity: 1 },  // Hardcover Desktop Planner
        { sku: 'HL-029', quantity: 1 }   // Concrete Succulent Planter Set
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
