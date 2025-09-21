'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageIcon, Loader2, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function TestAINewPage() {
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('road_damage');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const handleAnalyze = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image first');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const analysisResults = [];

      for (const image of images) {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('description', description || 'Image analysis');
        formData.append('issueType', issueType);
        formData.append('userId', 'test-user');

        try {
          const response = await fetch('/api/ai/analyze-content', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const analysis = await response.json();
            analysisResults.push(analysis);
          } else {
            const errorData = await response.json();
            analysisResults.push({ 
              error: `Analysis failed: ${response.status}`,
              message: errorData.details || 'Unknown error'
            });
          }
        } catch (error) {
          analysisResults.push({ 
            error: 'Network error', 
            message: 'Check your internet connection and API keys'
          });
        }
      }

      setResults({
        analyses: analysisResults,
        timestamp: new Date().toISOString()
      });

      toast.success('AI analysis completed!');
    } catch (err: any) {
      console.error('Error in AI analysis:', err);
      setError(`AI analysis failed: ${err.message || 'Unknown error'}`);
      toast.error(`AI analysis failed: ${err.message || 'Unknown error'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const testProviders = async () => {
    try {
      toast.info('Testing AI providers...');
      const response = await fetch('/api/ai/test-providers');
      const data = await response.json();
      
      if (data.success) {
        const providers = data.providers;
        const availableCount = Object.values(providers).filter((p: any) => p.available).length;
        
        if (availableCount > 0) {
          toast.success(`${availableCount} AI provider(s) working!`);
        } else {
          toast.warning('No AI providers available - check API keys');
        }
        
        console.log('Provider test results:', providers);
        
        // Show detailed results
        setResults({
          providerTest: providers,
          timestamp: new Date().toISOString()
        });
      } else {
        toast.error('Provider test failed');
      }
    } catch (error) {
      console.error('Provider test error:', error);
      toast.error('Provider test failed - check console for details');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">CivicEye AI Test</h1>
            <p className="text-white/70 text-lg">
              Test the new multi-provider AI system with OpenRouter, Groq, and fallback
            </p>
          </div>

          {/* Test Controls */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">AI Provider Test</CardTitle>
              <CardDescription className="text-white/70">
                Test which AI providers are available and working
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testProviders} className="bg-blue-600 hover:bg-blue-700">
                Test AI Providers
              </Button>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Upload Images</CardTitle>
              <CardDescription className="text-white/70">
                Upload images to test NSFW detection and civic issue analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Select Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {images.length > 0 && (
                  <p className="text-white/70 text-sm mt-2">
                    {images.length} image(s) selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the civic issue (e.g., 'Large potholes on main road causing traffic issues')..."
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  rows={3}
                />
                <p className="text-white/60 text-xs mt-1">
                  Tip: Include civic keywords like "road", "garbage", "drainage" for better analysis
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="road_damage">Road Damage</option>
                  <option value="waste_pileup">Waste Pileup</option>
                  <option value="water_drainage">Water Drainage</option>
                  <option value="street_lights">Street Lights</option>
                  <option value="traffic_lights">Traffic Lights</option>
                </select>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={images.length === 0 || analyzing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {analyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4 mr-2" />
                )}
                Analyze with AI
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Analysis Results</CardTitle>
              <CardDescription className="text-white/70">
                AI analysis results from multiple providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-500 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {results && (
                <div className="space-y-4">
                  {/* Provider Test Results */}
                  {results.providerTest && (
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <h4 className="text-white font-semibold mb-3">AI Provider Status</h4>
                      <div className="space-y-2">
                        {Object.entries(results.providerTest).map(([provider, status]: [string, any]) => (
                          <div key={provider} className="flex justify-between items-center">
                            <span className="text-white/80 text-sm capitalize">{provider}</span>
                            <div className="flex items-center gap-2">
                              {status.available ? (
                                <Badge variant="secondary" className="bg-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Available
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-red-600">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                              {status.error && (
                                <span className="text-red-200 text-xs">{status.error}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {results.analyses && results.analyses.map((analysis: any, index: number) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <ImageIcon className="w-4 h-4 text-white/70" />
                        <span className="text-white/70 text-sm">Image {index + 1}</span>
                      </div>
                      
                      {analysis.error ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="bg-red-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {analysis.error}
                          </Badge>
                          {analysis.message && (
                            <span className="text-red-200 text-xs">{analysis.message}</span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* NSFW Analysis */}
                          {analysis.analysis?.nsfwAnalysis && (
                            <div>
                              <h4 className="text-sm font-medium text-white mb-2">Content Safety</h4>
                              <div className="flex items-center gap-2">
                                {analysis.analysis.nsfwAnalysis.isHarmful ? (
                                  <Badge variant="destructive" className="bg-red-600">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Harmful Content Detected
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-green-600">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Safe Content
                                  </Badge>
                                )}
                                <span className="text-white/70 text-xs">
                                  Provider: {analysis.analysis.nsfwAnalysis.provider}
                                </span>
                              </div>
                              {analysis.analysis.nsfwAnalysis.reasoning && (
                                <p className="text-white/60 text-xs mt-1">
                                  {analysis.analysis.nsfwAnalysis.reasoning}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Civic Analysis */}
                          {analysis.analysis?.civicAnalysis && (
                            <div>
                              <h4 className="text-sm font-medium text-white mb-2">Civic Issue Analysis</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/80 text-sm">Severity</span>
                                  <Badge variant="outline" className="text-white border-white/30">
                                    {analysis.analysis.civicAnalysis.severity}/10
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/80 text-sm">Confidence</span>
                                  <Badge variant="outline" className="text-white border-white/30">
                                    {(analysis.analysis.civicAnalysis.confidence * 100).toFixed(1)}%
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/80 text-sm">Provider</span>
                                  <span className="text-white/60 text-xs">
                                    {analysis.analysis.civicAnalysis.provider}
                                  </span>
                                </div>
                                {analysis.analysis.civicAnalysis.reasoning && (
                                  <p className="text-white/60 text-xs">
                                    {analysis.analysis.civicAnalysis.reasoning}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                              {/* Providers Used */}
                              {analysis.analysis?.providersUsed && (
                                <div>
                                  <h4 className="text-sm font-medium text-white mb-2">AI Providers Used</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {analysis.analysis.providersUsed.map((provider: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-white border-white/30 text-xs">
                                        {provider}
                                      </Badge>
                                    ))}
                                  </div>
                                  <p className="text-white/60 text-xs mt-1">
                                    {analysis.analysis.providersUsed.includes('nsfw-civic-check') && 'Using civic content pre-check'}
                                    {analysis.analysis.providersUsed.includes('nsfw-explicit-check') && 'Using explicit content pre-check'}
                                    {analysis.analysis.providersUsed.includes('nsfw-fallback') && 'Using fallback provider'}
                                    {analysis.analysis.providersUsed.includes('nsfw-openrouter') && 'Using OpenRouter AI'}
                                    {analysis.analysis.providersUsed.includes('nsfw-groq') && 'Using Groq AI'}
                                  </p>
                                </div>
                              )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
