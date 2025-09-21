import { INDIAN_CONTEXT_PROMPTS, NSFW_ANALYSIS_PROMPT } from '../indianContext';

export class GroqProvider {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async analyzeContent(data: {
    text: string;
    task: 'nsfw' | 'civic_analysis';
    issueType?: string;
  }) {
    // Groq doesn't support vision, text analysis only
    const prompt = data.task === 'nsfw' 
      ? NSFW_ANALYSIS_PROMPT + `\n\nText to analyze: "${data.text}"`
      : INDIAN_CONTEXT_PROMPTS[data.issueType] + `\n\nDescription: "${data.text}"`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: data.task === 'nsfw' 
                ? 'You are a content moderation AI. Respond only with valid JSON.'
                : 'You are an expert in Indian civic issues. Respond only with valid JSON.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 400
        })
      });

      if (!response.ok) {
        throw new Error(`Groq failed: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch {
        return this.parseTextResponse(content, data.task);
      }

    } catch (error) {
      console.error('Groq provider failed:', error);
      throw error;
    }
  }

  private parseTextResponse(content: string, task: string): any {
    // Same parsing logic as OpenRouter
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
          reasoning: 'Explicit adult content detected in Groq text response',
          userPenalty: -10
        };
      }
      
      return {
        isHarmful: lower.includes('harmful') || lower.includes('inappropriate'),
        harmScore: lower.includes('severe') ? 8 : lower.includes('mild') ? 3 : 5,
        confidence: 0.7,
        reasoning: 'Groq text analysis',
        userPenalty: lower.includes('harmful') ? -10 : 0
      };
    }

    return {
      severity: lower.includes('severe') ? 8 : lower.includes('minor') ? 3 : 5,
      confidence: 0.7,
      reasoning: 'Groq civic analysis'
    };
  }
}
