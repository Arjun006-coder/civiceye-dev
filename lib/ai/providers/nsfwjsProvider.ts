import * as nsfwjs from 'nsfwjs';

export class NSFWJSProvider {
  private model: any = null;
  private initialized = false;

  async isAvailable(): Promise<boolean> {
    try {
      await this.initialize();
      return this.initialized;
    } catch (error) {
      console.error('NSFWJS initialization failed:', error);
      return false;
    }
  }

  private async initialize() {
    if (this.initialized) return;
    
    try {
      // Load the NSFWJS model
      this.model = await nsfwjs.load();
      this.initialized = true;
      console.log('✅ NSFWJS model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load NSFWJS model:', error);
      throw error;
    }
  }

  async analyzeContent(data: {
    imageBase64?: string;
    text: string;
    task: 'nsfw' | 'civic_analysis';
    issueType?: string;
  }) {
    if (data.task !== 'nsfw' || !data.imageBase64) {
      throw new Error('NSFWJS only supports NSFW analysis with images');
    }

    try {
      await this.initialize();
      
      // Convert base64 to image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            // Run NSFW detection
            const predictions = await this.model.classify(img);
            
            // Find the highest probability category
            const topPrediction = predictions.reduce((prev, current) => 
              (prev.probability > current.probability) ? prev : current
            );

            // NSFW categories from NSFWJS
            const nsfwCategories = ['Porn', 'Sexy', 'Hentai'];
            const isNSFW = nsfwCategories.includes(topPrediction.className);
            
            // Calculate harm score based on probability
            const harmScore = isNSFW ? Math.round(topPrediction.probability * 10) : 1;
            
            // Get detailed category scores
            const categoryScores = {
              nsfw: predictions.find(p => p.className === 'Porn')?.probability || 0,
              sexy: predictions.find(p => p.className === 'Sexy')?.probability || 0,
              hentai: predictions.find(p => p.className === 'Hentai')?.probability || 0,
              neutral: predictions.find(p => p.className === 'Neutral')?.probability || 0,
              drawing: predictions.find(p => p.className === 'Drawing')?.probability || 0
            };

            const result = {
              isHarmful: isNSFW && topPrediction.probability > 0.5,
              harmScore: Math.max(1, harmScore),
              categories: {
                nsfw: categoryScores.nsfw,
                violence: 0, // NSFWJS doesn't detect violence
                hate: 0,     // NSFWJS doesn't detect hate speech
                spam: 0      // NSFWJS doesn't detect spam
              },
              confidence: topPrediction.probability,
              reasoning: `NSFWJS detected: ${topPrediction.className} (${Math.round(topPrediction.probability * 100)}% confidence)`,
              userPenalty: (isNSFW && topPrediction.probability > 0.5) ? -10 : 0,
              provider: 'nsfwjs',
              detailedScores: categoryScores
            };

            console.log('📊 NSFWJS analysis result:', result);
            resolve(result);
            
          } catch (error) {
            console.error('❌ NSFWJS classification failed:', error);
            reject(error);
          }
        };

        img.onerror = (error) => {
          console.error('❌ Failed to load image for NSFWJS:', error);
          reject(new Error('Failed to load image'));
        };

        img.src = data.imageBase64;
      });

    } catch (error) {
      console.error('❌ NSFWJS analysis failed:', error);
      throw error;
    }
  }
}
