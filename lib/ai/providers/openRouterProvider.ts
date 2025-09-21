import { INDIAN_CONTEXT_PROMPTS, NSFW_ANALYSIS_PROMPT } from '../indianContext';

export class OpenRouterProvider {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async analyzeContent(data: {
    imageBase64?: string;
    text: string;
    task: 'nsfw' | 'civic_analysis';
    issueType?: string;
  }) {
    const model = data.imageBase64 
      ? 'google/gemini-flash-1.5'  // Vision capable
      : 'meta-llama/llama-3.1-8b-instruct'; // Text only

    const messages = this.buildMessages(data);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://civic-eye.vercel.app',
          'X-Title': 'CivicEye AI Analysis'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenRouter failed: ${response.status} - ${error.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch {
        return this.parseTextResponse(content, data.task);
      }

    } catch (error) {
      console.error('OpenRouter provider failed:', error);
      throw error;
    }
  }

  private buildMessages(data: any): any[] {
    const systemPrompt = data.task === 'nsfw' 
      ? 'You are a content moderation AI. Respond only with valid JSON.'
      : 'You are an expert in Indian civic infrastructure. Respond only with valid JSON.';

    if (data.imageBase64) {
      return [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: data.task === 'nsfw' 
                ? NSFW_ANALYSIS_PROMPT + `\n\nText: "${data.text}"`
                : INDIAN_CONTEXT_PROMPTS[data.issueType] + `\n\nDescription: "${data.text}"`
            },
            { type: 'image_url', image_url: { url: data.imageBase64 } }
          ]
        }
      ];
    }

    return [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: data.task === 'nsfw' 
          ? NSFW_ANALYSIS_PROMPT + `\n\nText: "${data.text}"`
          : INDIAN_CONTEXT_PROMPTS[data.issueType] + `\n\nDescription: "${data.text}"`
      }
    ];
  }

  private parseTextResponse(content: string, task: string): any {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.log('Failed to parse extracted JSON:', error);
      }
    }

    // Fallback parsing if JSON fails
    const lower = content.toLowerCase();
    
    if (task === 'nsfw') {
      // Check for civic keywords first
      const civicKeywords = ['civic', 'infrastructure', 'road', 'garbage', 'drainage', 'public', 'municipal'];
      const hasCivicContent = civicKeywords.some(keyword => lower.includes(keyword));
      
      if (hasCivicContent) {
        return {
          isHarmful: false,
          harmScore: 1,
          confidence: 0.8,
          reasoning: 'Civic infrastructure content detected - safe for public reporting',
          userPenalty: 0
        };
      }
      
      // Check for explicit content keywords
      const explicitKeywords = [
        'porn', 'nude', 'naked', 'sexual', 'explicit', 'adult', 'xxx', 'genitalia',
        'fuck', 'fucking', 'bitch', 'motherfucker', 'madarchod', 'behenchod', 'chut',
        'pussy', 'cock', 'dick', 'asshole', 'bastard', 'shit', 'damn', 'hell',
        'teri maa', 'maa ki', 'behen ki', 'chutiya', 'gandu', 'lodu', 'randi'
      ];
      const hasExplicitContent = explicitKeywords.some(keyword => lower.includes(keyword));
      
      if (hasExplicitContent) {
        return {
          isHarmful: true,
          harmScore: 9,
          confidence: 0.8,
          reasoning: 'Explicit adult content detected in text response',
          userPenalty: -10
        };
      }

      // Check for AI response patterns
      if (lower.includes('safe') || lower.includes('not harmful')) {
        return {
          isHarmful: false,
          harmScore: 1,
          confidence: 0.7,
          reasoning: 'AI determined content is safe',
          userPenalty: 0
        };
      }

      if (lower.includes('harmful') || lower.includes('inappropriate') || lower.includes('nsfw')) {
        return {
          isHarmful: true,
          harmScore: 7,
          confidence: 0.7,
          reasoning: 'AI determined content is harmful',
          userPenalty: -10
        };
      }
      
      return {
        isHarmful: lower.includes('harmful') || lower.includes('inappropriate'),
        harmScore: lower.includes('severe') ? 8 : lower.includes('mild') ? 3 : 5,
        confidence: 0.5,
        reasoning: 'Unable to parse AI response - defaulting to safe',
        userPenalty: lower.includes('harmful') ? -10 : 0
      };
    }

    // Civic analysis fallback
    if (lower.includes('severity') || lower.includes('high') || lower.includes('low')) {
      const severity = lower.includes('high') ? 8 : lower.includes('low') ? 3 : 5;
      return {
        severity,
        confidence: 0.7,
        reasoning: 'AI analysis parsed from text response'
      };
    }

    return {
      severity: 5,
      confidence: 0.5,
      reasoning: 'Unable to parse AI response - using default values'
    };
  }
}
