import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real app, we would authenticate the user here.
    // For demo purposes, we'll assume a dummy user if none exists.
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@sitota.com',
          name: 'Demo User',
        }
      });
    }

    const {
      productId,
      intentPrompt,
      logoUrl,
      textLine1,
      textLine2,
      placementHint,
      textColor,
      fontStyleHint, // Extracted custom font selection parameter
    } = data;

    // Fetch product details to ground our prompts and fallback
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productName = product.name;
    const productDescription = product.description || 'A premium corporate gift item';
    const parsedImages = product.images ? (product.images as string[]) : [];
    const baseProductImage = parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';

    const apiKey = process.env.GEMINI_API_KEY;
    let previewImageUrl = baseProductImage; // Default fallback
    let interpretationSummary = `Applied: ${placementHint || 'centered'} placement, default branding text.`;
    let logoDescription = "custom brand logo"; // Default logo descriptor

    // Describe the uploaded logo (only if a raster brand asset is provided)
    if (apiKey && logoUrl && logoUrl.startsWith('data:')) {
      try {
        const parts = logoUrl.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        const base64Data = parts[1];

        const isSupportedRaster = mimeType.includes('png') || mimeType.includes('jpeg') || mimeType.includes('jpg') || mimeType.includes('webp');

        if (isSupportedRaster) {
          console.log(`Parsing uploaded raster brand asset (${mimeType}) with Gemini 2.5 Vision...`);
          const visionRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { 
                    text: "Describe this uploaded brand logo in detail. What are its exact shapes, icons, text, symbols, and primary colors? Keep it extremely brief, under 12 words, without intro remarks. E.g. 'a red circular target symbol' or 'a blue modern lowercase 'a' text icon'." 
                  },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data
                    }
                  }
                ]
              }]
            })
          });

          if (visionRes.ok) {
            const visionData = await visionRes.json();
            const describedText = visionData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (describedText) {
              logoDescription = describedText.toLowerCase().replace(/\.$/, '');
              console.log('Gemini Vision successfully described the uploaded logo:', logoDescription);
            }
          }
        }
      } catch (visionErr) {
        console.error('Failed to analyze logo using Gemini Vision:', visionErr);
      }
    }

    // Generate dynamic interpretation summary text using Gemini 2.5 Flash if key is present
    if (apiKey) {
      try {
        const summaryPrompt = `You are an AI brand design assistant for Sitota. 
        Write a single, concise one-line summary (maximum 15 words) describing the product rendering based on these settings.
        Product: ${productName} (${product.category})
        User Custom Directive: "${intentPrompt || 'None'}"
        Brand Logo Description: "${logoDescription}"
        Text Inscription 1: "${textLine1 || 'None'}"
        Text Inscription 2: "${textLine2 || 'None'}"
        Logo Placement Option: "${placementHint || 'Centered'}"
        Color Choice: "${textColor || 'Auto'}"
        Font Choice: "${fontStyleHint || 'Auto'}"
        
        Output only the summary sentence, without quotes, introductory clauses, or extra spaces. E.g. "Applied left chest layout with custom ${logoDescription}, matte white ${fontStyleHint || 'serif'} text."`;

        const summaryRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: summaryPrompt }]
            }]
          })
        });

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          const generatedText = summaryData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (generatedText) {
            interpretationSummary = generatedText;
          }
        }
      } catch (summaryErr) {
        console.error('Failed to generate summary with Gemini 2.5 Flash:', summaryErr);
      }
    } else {
      // Offline fallback text
      if (textLine1 || textLine2) {
        interpretationSummary = `Simulated: Applied ${placementHint || 'centered'} placement for inscriptions: "${textLine1 || ''}" | "${textLine2 || ''}" in ${textColor || 'Auto'} (${fontStyleHint || 'Auto'}) on ${productName}.`;
      }
    }

    // STEP 3: Generate customized photorealistic product render using Pollinations AI (Flux.1)
    const imageGenerationPrompt = `A ultra-premium high-end professional studio catalog product photograph of a customized branded ${productName}.
    Product specifications: ${productDescription}.
    The customized product has the logo placed at the "${placementHint || 'Center'}".
    The logo design consists of: ${logoDescription}.
    The following custom text is written, printed, or debossed onto the actual surface texture of the product:
    Line 1: "${textLine1 || ''}"
    Line 2: "${textLine2 || ''}"
    Typography style font: ${fontStyleHint || 'Auto'}.
    Text and logo material color choice: ${textColor || 'Auto'}.
    The overall aesthetic matches this design directive: "${intentPrompt || 'clean, luxury minimalist packaging'}".
    Setting: Beautiful professional catalog flat-lay backdrop, exquisite high-end studio lighting, sharp focus, 8k resolution photograph. No raw text overlay, do not show any code or website interface elements.`;

    console.log('Dispatching prompt to Pollinations AI (Flux.1):', imageGenerationPrompt);

    try {
      // Query Pollinations AI (Flux) on server side to fetch binary image and convert to Base64 Data URI
      const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(imageGenerationPrompt)}?width=800&height=800&nologo=true&private=true&model=flux`;
      
      const imageRes = await fetch(pollinationsUrl);
      
      if (imageRes.ok) {
        const arrayBuffer = await imageRes.arrayBuffer();
        const base64Bytes = Buffer.from(arrayBuffer).toString('base64');
        previewImageUrl = `data:image/jpeg;base64,${base64Bytes}`;
        console.log('Pollinations AI (Flux.1) render successfully generated.');
      } else {
        console.error('Pollinations AI returned non-ok status:', imageRes.status);
      }
    } catch (imageErr) {
      console.error('Error during Pollinations AI image generation:', imageErr);
    }

    // Save the customized design configuration to DB
    const design = await prisma.design.create({
      data: {
        userId: user.id,
        productId,
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
