'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ISSUE_TYPES = [
  "Street Light Problem",
  "Flooding", 
  "Garbage",
  "Pothole",
  "Traffic Signal Issue"
];

export default function TestAIPage() {
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [expectedIssueType, setExpectedIssueType] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImages(files);
    }
  };

  const handleImageUpload = async () => {
    if (images.length === 0) return;

    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];

      for (const file of images) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'test_ai');

        const response = await fetch('/api/test-upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          let message = `Failed to upload ${file.name}`;
          try {
            const data = await response.json();
            if (data?.error) message = data.error;
          } catch {}
          throw new Error(message);
        }
      }
      setUploadedImageUrls(uploadedUrls);
      setImages([]);
      toast.success('Images uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading images:', err);
      setError(`Failed to upload images: ${err.message || 'Unknown error'}`);
      toast.error(`Image upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAnalyze = async () => {
    if (uploadedImageUrls.length === 0) {
      toast.error('Please upload at least one image first');
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      setResults(null);

      // Test both NSFW detection and issue classification
      const nsfwResults = [];
      const classificationResults = [];

      for (const imageUrl of uploadedImageUrls) {
        // NSFW Check
        const nsfwFormData = new FormData();
        const nsfwResponse = await fetch(imageUrl);
        const nsfwBlob = await nsfwResponse.blob();
        nsfwFormData.append('image', nsfwBlob);

        const nsfwResult = await fetch('https://ai-service-production-5eed.up.railway.app/nsfw-check', {
          method: 'POST',
          body: nsfwFormData,
        });

        if (nsfwResult.ok) {
          nsfwResults.push(await nsfwResult.json());
        } else {
          console.error('NSFW check failed:', nsfwResult.status, nsfwResult.statusText);
          nsfwResults.push({ error: `NSFW check failed: ${nsfwResult.status}` });
        }

        // Issue Classification
        const classifyFormData = new FormData();
        classifyFormData.append('image', nsfwBlob);

        const classifyResult = await fetch('https://ai-service-production-5eed.up.railway.app/issue-classify', {
          method: 'POST',
          body: classifyFormData,
        });

        if (classifyResult.ok) {
          classificationResults.push(await classifyResult.json());
        } else {
          console.error('Issue classification failed:', classifyResult.status, classifyResult.statusText);
          classificationResults.push({ error: `Classification failed: ${classifyResult.status}` });
        }
      }

      setResults({
        nsfw: nsfwResults,
        classification: classificationResults,
        expectedIssueType,
        description
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">AI Features Test</h1>
            <p className="text-xl text-white/80">
              Test NSFW detection and issue classification with your own images
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Input Section */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Test Configuration</CardTitle>
                <CardDescription className="text-white/70">
                  Upload images and configure test parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="images" className="text-white">Upload Images</Label>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full p-2 border border-white/20 rounded-md bg-white/10 text-white"
                  />
                  {images.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleImageUpload}
                        disabled={uploadingImages}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {uploadingImages ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload Images
                      </Button>
                      <span className="text-white/70 text-sm">
                        {images.length} file(s) selected
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue you're testing..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                </div>

                {/* Expected Issue Type */}
                <div className="space-y-2">
                  <Label htmlFor="issue-type" className="text-white">Expected Issue Type</Label>
                  <Select value={expectedIssueType} onValueChange={setExpectedIssueType}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select expected issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={uploadedImageUrls.length === 0 || analyzing}
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
                  NSFW detection and issue classification results
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
                    {/* NSFW Results */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">NSFW Detection</h3>
                      {results.nsfw.map((result: any, index: number) => (
                        <div key={index} className="mb-2 p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-white/70" />
                            <span className="text-white/70 text-sm">Image {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {result.flagged ? (
                              <Badge variant="destructive" className="bg-red-600">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                NSFW Detected
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Safe Content
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Classification Results */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Issue Classification</h3>
                      {results.classification.map((result: any, index: number) => (
                        <div key={index} className="mb-2 p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-white/70" />
                            <span className="text-white/70 text-sm">Image {index + 1}</span>
                          </div>
                          <div className="space-y-1">
                            {result.map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="flex justify-between items-center">
                                <span className="text-white/80 text-sm">{item.label}</span>
                                <Badge variant="outline" className="text-white border-white/30">
                                  {(item.score * 100).toFixed(1)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expected vs Actual */}
                    {results.expectedIssueType && (
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <h4 className="text-white font-semibold mb-2">Expected vs Detected</h4>
                        <div className="space-y-1 text-sm">
                          <div className="text-white/80">
                            <span className="font-medium">Expected:</span> {results.expectedIssueType}
                          </div>
                          <div className="text-white/80">
                            <span className="font-medium">Description:</span> {results.description || 'None'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!results && !error && (
                  <div className="text-center text-white/50 py-8">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Upload images and click "Analyze with AI" to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImageUrls.length > 0 && (
            <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Uploaded Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Uploaded image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-white/20"
                      />
                      <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}