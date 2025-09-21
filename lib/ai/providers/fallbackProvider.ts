export class FallbackProvider {
  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  analyzeContent(data: {
    imageBase64?: string;
    text: string;
    task: 'nsfw' | 'civic_analysis';
    issueType?: string;
  }): any {
    if (data.task === 'nsfw') {
      return this.analyzeHarmfulContent(data.text, data.imageBase64);
    }
    return this.analyzeCivicIssue(data.text, data.issueType || 'road_damage');
  }

  private analyzeHarmfulContent(text: string, imageBase64?: string) {
    // Civic issue keywords that should NOT be flagged as harmful
    const civicKeywords = [
      'pothole', 'road', 'damage', 'garbage', 'waste', 'drainage', 'sewage', 
      'street light', 'traffic', 'infrastructure', 'civic', 'public', 'municipal',
      'pollution', 'environment', 'maintenance', 'repair', 'construction'
    ];

    const lowerText = text.toLowerCase();
    
    // If text contains civic keywords, it's safe
    const hasCivicKeywords = civicKeywords.some(keyword => lowerText.includes(keyword));
    if (hasCivicKeywords) {
      return {
        isHarmful: false,
        harmScore: 1,
        categories: { nsfw: 0, violence: 0, hate: 0, spam: 0 },
        confidence: 0.9,
        reasoning: 'Civic infrastructure content - safe for public reporting',
        userPenalty: 0
      };
    }

    // Basic image analysis for NSFW content
    if (imageBase64) {
      const imageAnalysis = this.analyzeImageContent(imageBase64);
      if (imageAnalysis.isHarmful) {
        return imageAnalysis;
      }
    }

    // Only check for actual harmful content
    const harmfulKeywords = [
      // Violence (more comprehensive)
      'kill', 'murder', 'weapon', 'bomb', 'gun', 'knife', 'threaten', 'violence',
      'blood', 'stained', 'bloody', 'attack', 'fight', 'fighting', 'stab', 'cut',
      'weapons', 'bombs', 'guns', 'knives', 'threats', 'violent', 'aggression',
      // NSFW (more specific and comprehensive)
      'porn', 'pornographic', 'nude', 'naked', 'sexual', 'explicit', 'adult', 'xxx',
      'sex', 'nudity', 'genitalia', 'breast', 'penis', 'vagina', 'buttocks',
      'xvideos', 'pornhub', 'adult website', 'sexual act', 'masturbation',
      // Profanity and abuse (comprehensive)
      'fuck', 'fucking', 'bitch', 'motherfucker', 'madarchod', 'behenchod', 'chut',
      'pussy', 'cock', 'dick', 'asshole', 'bastard', 'shit', 'damn', 'hell',
      'teri maa', 'maa ki', 'behen ki', 'chutiya', 'gandu', 'lodu', 'randi',
      // Spam (more specific)
      'free money', 'lottery winner', 'click here now', 'urgent offer',
      // Hate speech (more specific)
      'terrorist', 'kill all', 'hate group', 'discrimination'
    ];

    const matches = harmfulKeywords.filter(keyword => lowerText.includes(keyword));
    
    const harmScore = Math.min(10, matches.length * 3);
    const isHarmful = harmScore >= 6;

    return {
      isHarmful,
      harmScore,
      categories: {
        nsfw: lowerText.includes('sex') || lowerText.includes('nude') ? 0.8 : 0,
        violence: lowerText.includes('kill') || lowerText.includes('weapon') ? 0.8 : 0,
        hate: lowerText.includes('hate') || lowerText.includes('terrorist') ? 0.8 : 0,
        spam: lowerText.includes('buy now') || lowerText.includes('free money') ? 0.8 : 0
      },
      confidence: 0.8,
      reasoning: `Rule-based analysis found ${matches.length} harmful keywords: ${matches.join(', ')}`,
      userPenalty: isHarmful ? -10 : 0
    };
  }

  private analyzeCivicIssue(text: string, issueType: string) {
    const lowerText = text.toLowerCase();
    
    // Check if the text actually matches the issue type
    const issueTypeKeywords = {
      road_damage: ['pothole', 'potholes', 'road', 'damage', 'crack', 'cracks', 'broken', 'pavement'],
      waste_pileup: ['garbage', 'waste', 'trash', 'pile', 'dump', 'litter', 'rubbish'],
      water_drainage: ['drainage', 'sewage', 'water', 'flood', 'overflow', 'drain'],
      street_lights: ['light', 'lights', 'street light', 'lamp', 'dark', 'illumination'],
      traffic_lights: ['traffic', 'signal', 'signals', 'junction', 'intersection']
    };

    const relevantKeywords = issueTypeKeywords[issueType] || [];
    const hasRelevantKeywords = relevantKeywords.some(keyword => lowerText.includes(keyword));
    
    // If text doesn't match the issue type, return low confidence
    if (!hasRelevantKeywords) {
      return {
        severity: 1,
        confidence: 0.1,
        contextualFactors: ['text does not match issue type'],
        recommendations: ['verify issue type'],
        urgencyLevel: 'low',
        reasoning: `Text does not contain keywords relevant to ${issueType}`
      };
    }
    
    // Base severity calculation
    let severity = 3;
    
    // Indian context keywords that increase severity
    const severityKeywords = {
      high: ['huge', 'massive', 'everywhere', 'terrible', 'horrible', 'dangerous', 'emergency', 'years'],
      medium: ['big', 'large', 'bad', 'problem', 'issue', 'broken', 'much'],
      monsoon: ['rain', 'water', 'flood', 'overflow', 'wet'],
      health: ['smell', 'dirty', 'disease', 'sick', 'pollution']
    };

    // Calculate severity based on keywords
    severityKeywords.high.forEach(keyword => {
      if (lowerText.includes(keyword)) severity += 2;
    });
    
    severityKeywords.medium.forEach(keyword => {
      if (lowerText.includes(keyword)) severity += 1;
    });

    severityKeywords.monsoon.forEach(keyword => {
      if (lowerText.includes(keyword)) severity += 1;
    });

    severityKeywords.health.forEach(keyword => {
      if (lowerText.includes(keyword)) severity += 1;
    });

    severity = Math.min(10, Math.max(1, severity));

    const urgencyMap = {
      1: 'low', 2: 'low', 3: 'low',
      4: 'medium', 5: 'medium', 6: 'medium',
      7: 'high', 8: 'high',
      9: 'critical', 10: 'critical'
    };

    const contextualFactors = {
      road_damage: ['monsoon impact', 'heavy traffic', 'poor maintenance'],
      waste_pileup: ['health hazard', 'monsoon spread risk', 'disease vectors'],
      water_drainage: ['sewage contamination', 'mosquito breeding', 'epidemic risk'],
      street_lights: ['accident risk', 'crime concern', 'women safety'],
      traffic_lights: ['traffic chaos', 'gridlock risk', 'emergency access']
    };

    return {
      severity,
      confidence: 0.7,
      contextualFactors: contextualFactors[issueType] || ['general infrastructure'],
      recommendations: severity >= 8 ? ['immediate action', 'emergency response'] : ['scheduled repair', 'assessment needed'],
      urgencyLevel: urgencyMap[severity],
      reasoning: `Rule-based analysis: severity ${severity}/10 based on text patterns for ${issueType}`
    };
  }

  private analyzeImageContent(imageBase64: string) {
    // Basic image analysis using file size and format heuristics
    // This is a simplified approach - in production you'd use proper image analysis
    
    try {
      // Check if it's a valid image
      if (!imageBase64.startsWith('data:image/')) {
        return {
          isHarmful: false,
          harmScore: 1,
          categories: { nsfw: 0, violence: 0, hate: 0, spam: 0 },
          confidence: 0.3,
          reasoning: 'Invalid image format',
          userPenalty: 0
        };
      }

      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64Data = imageBase64.split(',')[1];
      const imageSize = base64Data.length;
      
      // Very large images might be suspicious (but this is not reliable)
      if (imageSize > 2000000) { // ~1.5MB base64
        return {
          isHarmful: true,
          harmScore: 7,
          categories: { nsfw: 0.8, violence: 0, hate: 0, spam: 0 },
          confidence: 0.4,
          reasoning: 'Large image size detected - potential NSFW content',
          userPenalty: -10
        };
      }

      // For now, we can't do proper image analysis without AI
      // So we'll be conservative and mark as safe unless we have strong indicators
      return {
        isHarmful: false,
        harmScore: 2,
        categories: { nsfw: 0.1, violence: 0, hate: 0, spam: 0 },
        confidence: 0.2,
        reasoning: 'Basic image analysis - no obvious harmful content detected',
        userPenalty: 0
      };

    } catch (error) {
      return {
        isHarmful: false,
        harmScore: 1,
        categories: { nsfw: 0, violence: 0, hate: 0, spam: 0 },
        confidence: 0.1,
        reasoning: 'Image analysis failed - treating as safe',
        userPenalty: 0
      };
    }
  }
}
