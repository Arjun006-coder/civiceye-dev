import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeImage, checkTextNSFW, calculateAIConfidenceScore } from '@/lib/ai-utils';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { images, description } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Check text description for NSFW content
    let textNSFWResult = {
      isNSFW: false,
      categories: {},
      scores: {},
      flagged: false
    };

    if (description && description.trim()) {
      textNSFWResult = await checkTextNSFW(description);
    }

    // Analyze each image
    const imageAnalysisResults = await Promise.all(
      images.map(async (imageUrl: string) => {
        return await analyzeImage(imageUrl);
      })
    );

    // Check if any image contains NSFW content
    const hasNSFWImages = imageAnalysisResults.some(result => result.nsfw.flagged);
    const hasTextNSFW = textNSFWResult.flagged;
    const hasAnyNSFW = hasNSFWImages || hasTextNSFW;

    // Get the best issue classification from all images
    let bestIssueClassification = {
      issueType: null as string | null,
      confidence: 0,
      allScores: [] as Array<{ type: string; score: number }>
    };

    if (!hasNSFWImages) {
      // Find the best issue classification across all images
      for (const result of imageAnalysisResults) {
        if (result.issueClassification.confidence > bestIssueClassification.confidence) {
          bestIssueClassification = result.issueClassification;
        }
      }
    }

    // Calculate AI confidence score
    const aiConfidenceScore = calculateAIConfidenceScore(bestIssueClassification);

    // Determine if report should be blocked
    const shouldBlock = hasAnyNSFW;

    return NextResponse.json({
      success: true,
      analysis: {
        nsfw: {
          hasNSFWImages,
          hasTextNSFW,
          hasAnyNSFW,
          imageResults: imageAnalysisResults.map(result => result.nsfw),
          textResult: textNSFWResult
        },
        issueClassification: bestIssueClassification,
        aiConfidenceScore,
        shouldBlock
      }
    });

  } catch (error) {
    console.error('Error in AI analysis:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

