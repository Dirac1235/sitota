import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateVisualRender, generateContentSummary, describeBrandAsset } from '@/lib/gemini';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 1. Resolve logged-in session or guest user securely
    const session = await getServerSession(authOptions);
    let userId = '';

    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (dbUser) {
        userId = dbUser.id;
      }
    }

    if (!userId) {
      // Find or create a shared guest account for unauthenticated customization
      let guestUser = await prisma.user.findUnique({
        where: { email: 'guest@sitota.com' }
      });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: 'guest@sitota.com',
            name: 'Guest Workspace',
            role: 'STANDARD_USER'
          }
        });
      }
      userId = guestUser.id;
    }

    // 2. Check if duplicating an existing design
    if (data.duplicateId) {
      const sourceDesign = await prisma.design.findUnique({
        where: { id: data.duplicateId }
      });
      if (!sourceDesign) {
        return NextResponse.json({ error: 'Source design not found' }, { status: 404 });
      }
      
      const duplicatedDesign = await prisma.design.create({
        data: {
          userId: userId, // Securely claim duplication to currently active user
          productId: sourceDesign.productId,
          bundleId: sourceDesign.bundleId,
          intentPrompt: sourceDesign.intentPrompt,
          logoUrl: sourceDesign.logoUrl,
          textLine1: sourceDesign.textLine1 ? `${sourceDesign.textLine1} (Copy)` : '',
          textLine2: sourceDesign.textLine2,
          placementHint: sourceDesign.placementHint,
          textColor: sourceDesign.textColor,
          fontStyleHint: sourceDesign.fontStyleHint,
          aiInterpretationSummary: sourceDesign.aiInterpretationSummary,
          previewImageUrl: sourceDesign.previewImageUrl,
          status: 'DRAFT'
        }
      });
      
      return NextResponse.json({ success: true, designId: duplicatedDesign.id });
    }

    const {
      productId,
      bundleId,
      intentPrompt,
      logoUrl,
      textLine1,
      textLine2,
      placementHint,
      textColor,
      fontStyleHint,
    } = data;

    if (!productId && !bundleId) {
      return NextResponse.json({ error: 'Either Product ID or Bundle ID is required' }, { status: 400 });
    }

    let itemName = '';
    let itemDescription = '';
    let baseImageUrl = 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';
    let category = 'Corporate Gift';

    if (productId) {
      // Fetch product details
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      itemName = product.name;
      itemDescription = product.description || 'A premium corporate gift item';
      category = product.category;
      const parsedImages = product.images ? (product.images as string[]) : [];
      baseImageUrl = parsedImages[0] || baseImageUrl;
    } else {
      // Fetch bundle details
      const bundle = await prisma.bundle.findUnique({
        where: { id: bundleId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!bundle) {
        return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
      }

      itemName = bundle.name;
      category = 'Curated Box';
      
      // Construct elegant flat-lay descriptors
      const productNames = bundle.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ');
      itemDescription = `An ultra-premium corporate gift bundle set consisting of: ${productNames}. Each customized cleanly as a harmonized collection.`;
      
      // Use standard Unsplash flat-lay packaging container box for bundles
      baseImageUrl = 'https://images.unsplash.com/photo-1607344645866-eea33a4e2e27?q=80&w=1200&auto=format&fit=crop';
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let previewImageUrl = baseImageUrl; // Default fallback
    let interpretationSummary = `Applied: ${placementHint || 'centered'} placement, default branding text.`;
    let logoDescription = "custom brand logo"; // Default logo descriptor

    if (apiKey) {
      console.log('[API Route] Live Gemini API Key detected. Triggering official SDK pipeline...');

      // STEP 1: Describe logo using Gemini 2.5 Vision (only if a supported raster brand asset is provided)
      if (logoUrl && logoUrl.startsWith('data:')) {
        try {
          const parts = logoUrl.split(';base64,');
          const mimeType = parts[0].split(':')[1];
          const base64Data = parts[1];

          // Vector graphics (SVGs) are handled natively on layout rather than vision analysis
          const isSupportedRaster = mimeType.includes('png') || mimeType.includes('jpeg') || mimeType.includes('jpg') || mimeType.includes('webp');

          if (isSupportedRaster) {
            console.log(`[API Route] Invoking describeBrandAsset for raster image: ${mimeType}`);
            const describedText = await describeBrandAsset(base64Data, mimeType);
            if (describedText) {
              logoDescription = describedText.toLowerCase().replace(/\.$/, '');
              console.log('[API Route] Gemini Vision logo description:', logoDescription);
            }
          } else {
            console.log(`[API Route] SVGs skipped for vision analysis. MIME type: ${mimeType}`);
            logoDescription = "clean vector branding logo";
          }
        } catch (visionErr) {
          console.error('[API Route] Failed during logo analysis pre-pass:', visionErr);
        }
      }

      // Extract actual prompt directive and strip serialized JSON metadata (Section 2.3)
      let promptForAI = intentPrompt || '';
      if (intentPrompt && intentPrompt.includes('|||JSON|||')) {
        promptForAI = intentPrompt.split('|||JSON|||')[0].trim();
      }

      // STEP 2: Generate text interpretation summary using Gemini 2.5 Flash
      try {
        const summaryPrompt = `You are an AI brand design assistant for Sitota. 
        Write a single, concise one-line summary (maximum 15 words) describing the product rendering based on these settings.
        Collection/Product: ${itemName} (${category})
        User Custom Directive: "${promptForAI || 'None'}"
        Brand Logo Description: "${logoDescription}"
        Text Inscription 1: "${textLine1 || 'None'}"
        Text Inscription 2: "${textLine2 || 'None'}"
        Logo Placement Option: "${placementHint || 'Centered'}"
        Color Choice: "${textColor || 'Auto'}"
        Font Choice: "${fontStyleHint || 'Auto'}"
        
        Output only the summary sentence, without quotes, introductory clauses, or extra spaces. E.g. "Applied left chest layout with custom ${logoDescription}, matte white ${fontStyleHint || 'serif'} text."`;

        const summaryText = await generateContentSummary(summaryPrompt);
        if (summaryText) {
          interpretationSummary = summaryText;
        }
      } catch (summaryErr) {
        console.error('[API Route] Summary generation exception:', summaryErr);
      }

      // STEP 3: Generate customized photorealistic product render using Gemini Imagen 3 via unified SDK
      const imageGenerationPrompt = `A ultra-premium high-end professional studio catalog product photograph of a customized branded ${itemName}.
      Specifications and elements: ${itemDescription}.
      The customized elements have the logo placed at the "${placementHint || 'Center'}".
      The logo design consists of: ${logoDescription}.
      The following custom text is written, printed, or debossed onto the actual surface texture of the products:
      Line 1: "${textLine1 || ''}"
      Line 2: "${textLine2 || ''}"
      Typography style font: ${fontStyleHint || 'Auto'}.
      Text and logo material color choice: ${textColor || 'Auto'}.
      The overall aesthetic matches this design directive: "${promptForAI || 'clean, luxury minimalist packaging'}".
      Setting: Beautiful professional catalog flat-lay backdrop, exquisite high-end studio lighting, sharp focus, 8k resolution photograph. No raw text overlay, do not show any code or website interface elements.`;

      try {
        const imageResult = await generateVisualRender(imageGenerationPrompt, {
          aspectRatio: '1:1',
          numberOfImages: 1,
        });

        if (imageResult.success && imageResult.imageBytes) {
          previewImageUrl = `data:image/jpeg;base64,${imageResult.imageBytes}`;
          console.log('[API Route] Official Gemini SDK Imagen 3 render successfully generated.');
        } else {
          console.warn('[API Route] Gemini SDK returned unsuccessful payload:', imageResult.error);
        }
      } catch (imageErr) {
        console.error('[API Route] Image Generation failed during SDK invocation:', imageErr);
      }

    } else {
      console.log('[API Route] No Gemini API key detected. Running in sandbox simulation mode.');
      // Simulate rendering engine delay for natural UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Customize summary based on text inputs to feel realistic even in sandbox
      if (textLine1 || textLine2) {
        interpretationSummary = `Simulated: Applied ${placementHint || 'centered'} placement for inscriptions: "${textLine1 || ''}" | "${textLine2 || ''}" in ${textColor || 'Auto'} (${fontStyleHint || 'Auto'}) on ${itemName}.`;
      }
    }

    // Save the customized design configuration to DB
    const design = await prisma.design.create({
      data: {
        userId: userId,
        productId: productId || null,
        bundleId: bundleId || null,
        intentPrompt,
        logoUrl: logoUrl || '',
        textLine1,
        textLine2,
        placementHint,
        textColor,
        fontStyleHint: fontStyleHint || 'Auto', // Stored fontStyleHint
        aiInterpretationSummary: interpretationSummary,
        previewImageUrl: previewImageUrl,
        status: 'DRAFT'
      }
    });

    return NextResponse.json({ 
      success: true, 
      designId: design.id,
      previewUrl: previewImageUrl,
      interpretation: interpretationSummary
    });
    
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User records mismatch' }, { status: 404 });
    }

    const designs = await prisma.design.findMany({
      where: { userId: dbUser.id },
      include: {
        product: true,
        bundle: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ designs });

  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User records mismatch' }, { status: 404 });
    }

    const data = await request.json();
    const { id, status } = data;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing design modification variables' }, { status: 400 });
    }

    const design = await prisma.design.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, design });

  } catch (error) {
    console.error('Error modifying design:', error);
    return NextResponse.json({ error: 'Failed to modify design' }, { status: 500 });
  }
}
