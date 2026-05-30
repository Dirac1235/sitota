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
      textColor
    } = data;

    // Simulate AI generation delay (this would be where we call Claude/StableDiffusion)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fake interpretation and preview URL
    const interpretationSummary = `Applied: ${placementHint || 'centered'} logo, ${textColor || 'white'} text based on intent.`;
    const dummyPreviewUrl = `https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600&blend=000000&blend-alpha=30&blend-mode=overlay`; // Just a darkened mug

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
        aiInterpretationSummary: interpretationSummary,
        previewImageUrl: dummyPreviewUrl,
        status: 'DRAFT'
      }
    });

    return NextResponse.json({ 
      success: true, 
      designId: design.id,
      previewUrl: dummyPreviewUrl,
      interpretation: interpretationSummary
    });
    
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
