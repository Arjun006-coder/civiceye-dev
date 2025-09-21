import { OpenRouterProvider } from './providers/openRouterProvider';
import { GroqProvider } from './providers/groqProvider';
import { FallbackProvider } from './providers/fallbackProvider';
import { NSFWJSProvider } from './providers/nsfwjsProvider';

export class MultiProviderAI {
  private providers: {
    primary: OpenRouterProvider;
    secondary: GroqProvider;
    nsfwjs: NSFWJSProvider;
    fallback: FallbackProvider;
  };

  constructor() {
    this.providers = {
      primary: new OpenRouterProvider(),
      secondary: new GroqProvider(),
      nsfwjs: new NSFWJSProvider(),
      fallback: new FallbackProvider()
    };
  }

  async analyzeContent(data: {
    imageBase64?: string;
    description: string;
    issueType: string;
    userId: string;
  }) {
    const results = {
      nsfwAnalysis: null as any,
      civicAnalysis: null as any,
      providersUsed: [] as string[],
      success: false
    };

    // Step 1: NSFW/Harmful Content Analysis
    results.nsfwAnalysis = await this.runNSFWAnalysis({
      imageBase64: data.imageBase64,
      text: data.description
    });
    results.providersUsed.push(`nsfw-${results.nsfwAnalysis.provider}`);

    // Step 2: Civic Issue Analysis (only if content is safe)
    if (!results.nsfwAnalysis.isHarmful) {
      results.civicAnalysis = await this.runCivicAnalysis({
        imageBase64: data.imageBase64,
        text: data.description,
        issueType: data.issueType
      });
      results.providersUsed.push(`civic-${results.civicAnalysis.provider}`);
    } else {
      // If content is harmful, skip civic analysis
      results.civicAnalysis = {
        severity: 0,
        confidence: 0,
        reasoning: 'Skipped due to harmful content',
        provider: 'skipped'
      };
    }

    results.success = true;
    return results;
  }

  private async runNSFWAnalysis(data: { imageBase64?: string; text: string }) {
    const lowerText = data.text.toLowerCase();
    
    // Pre-check for explicit content to catch it immediately
    const explicitKeywords = [
      'porn', 'pornographic', 'nude', 'naked', 'sexual', 'explicit', 'adult', 'xxx',
      'sex', 'nudity', 'genitalia', 'breast', 'penis', 'vagina', 'buttocks',
      'xvideos', 'pornhub', 'adult website', 'sexual act', 'masturbation',
      // Violence
      'kill', 'murder', 'weapon', 'bomb', 'gun', 'knife', 'threaten', 'violence',
      'blood', 'stained', 'bloody', 'attack', 'fight', 'fighting', 'stab', 'cut',
      // Profanity and abuse
      'fuck', 'fucking', 'bitch', 'motherfucker', 'madarchod', 'behenchod', 'chut',
      'pussy', 'cock', 'dick', 'asshole', 'bastard', 'shit', 'damn', 'hell',
      'teri maa', 'maa ki', 'behen ki', 'chutiya', 'gandu', 'lodu', 'randi'
    ];
    
    const hasExplicitContent = explicitKeywords.some(keyword => lowerText.includes(keyword));
    if (hasExplicitContent) {
      return {
        isHarmful: true,
        harmScore: 9,
        confidence: 0.9,
        reasoning: 'Explicit adult content detected in description',
        provider: 'explicit-check'
      };
    }
    
    // Pre-check for civic content to avoid false positives
    const civicKeywords = [
      'pothole', 'road', 'damage', 'garbage', 'waste', 'drainage', 'sewage',
      'street light', 'traffic', 'infrastructure', 'civic', 'public', 'municipal',
      'pollution', 'environment', 'maintenance', 'repair', 'construction'
    ];
    
    const hasCivicContent = civicKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasCivicContent) {
      return {
        isHarmful: false,
        harmScore: 1,
        confidence: 0.9,
        reasoning: 'Civic infrastructure content - safe for public reporting',
        provider: 'civic-check'
      };
    }

    // Prioritize vision-capable providers when image is present
    const providers = data.imageBase64 
      ? [
          { name: 'nsfwjs', instance: this.providers.nsfwjs },       // Local NSFW detection
          { name: 'openrouter', instance: this.providers.primary },  // Vision capable
          { name: 'fallback', instance: this.providers.fallback },   // Basic image analysis
          { name: 'groq', instance: this.providers.secondary }       // Text only
        ]
      : [
          { name: 'openrouter', instance: this.providers.primary },
          { name: 'groq', instance: this.providers.secondary },
          { name: 'fallback', instance: this.providers.fallback }
        ];

    for (const provider of providers) {
      try {
        console.log(`🔍 Trying ${provider.name} for NSFW analysis...`);
        if (await provider.instance.isAvailable()) {
          console.log(`✅ ${provider.name} is available, analyzing...`);
          const result = await provider.instance.analyzeContent({
            ...data,
            task: 'nsfw'
          });
          
          console.log(`📊 ${provider.name} NSFW result:`, result);
          return {
            ...result,
            provider: provider.name
          };
        } else {
          console.log(`❌ ${provider.name} not available`);
        }
      } catch (error) {
        console.error(`❌ ${provider.name} NSFW analysis failed:`, error);
        continue;
      }
    }

    // If all providers fail, return safe default
    return {
      isHarmful: false,
      harmScore: 0,
      confidence: 0,
      reasoning: 'All providers failed, defaulting to safe',
      provider: 'default'
    };
  }

  private async runCivicAnalysis(data: { imageBase64?: string; text: string; issueType: string }) {
    // Try providers in order: OpenRouter -> Groq -> Fallback
    const providers = [
      { name: 'openrouter', instance: this.providers.primary },
      { name: 'groq', instance: this.providers.secondary },
      { name: 'fallback', instance: this.providers.fallback }
    ];

    for (const provider of providers) {
      try {
        console.log(`🔍 Trying ${provider.name} for civic analysis...`);
        if (await provider.instance.isAvailable()) {
          console.log(`✅ ${provider.name} is available, analyzing civic issue...`);
          const result = await provider.instance.analyzeContent({
            ...data,
            task: 'civic_analysis'
          });
          
          console.log(`📊 ${provider.name} civic result:`, result);
          return {
            ...result,
            provider: provider.name
          };
        } else {
          console.log(`❌ ${provider.name} not available for civic analysis`);
        }
      } catch (error) {
        console.error(`❌ ${provider.name} civic analysis failed:`, error);
        continue;
      }
    }

    // If all providers fail, return default analysis
    return {
      severity: 5,
      confidence: 0,
      reasoning: 'All providers failed, using default analysis',
      provider: 'default'
    };
  }

  async testProviders() {
    const testData = {
      text: "There's a huge pothole on the main road causing traffic jams",
      task: 'civic_analysis' as const,
      issueType: 'road_damage'
    };

    const results = {
      openrouter: { available: false, error: null as string | null },
      groq: { available: false, error: null as string | null },
      fallback: { available: true, error: null as string | null }
    };

    // Test OpenRouter
    try {
      if (await this.providers.primary.isAvailable()) {
        await this.providers.primary.analyzeContent(testData);
        results.openrouter.available = true;
      } else {
        results.openrouter.error = 'API key not configured';
      }
    } catch (error) {
      results.openrouter.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test Groq
    try {
      if (await this.providers.secondary.isAvailable()) {
        await this.providers.secondary.analyzeContent(testData);
        results.groq.available = true;
      } else {
        results.groq.error = 'API key not configured';
      }
    } catch (error) {
      results.groq.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return results;
  }
}
