'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Camera, Upload, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { AlertTriangle } from "lucide-react";

const ReportPage = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issue_category_id: '',
    latitude: '',
    longitude: '',
    address: '',
    images: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Mock issue categories - in real app, fetch from API
  const issueCategories = [
    { id: '1', type: 'road_damage', description: 'Potholes, cracks, road damage' },
    { id: '2', type: 'street_lights', description: 'Broken or malfunctioning street lights' },
    { id: '3', type: 'traffic_lights', description: 'Traffic signal issues' },
    { id: '4', type: 'water_drainage', description: 'Water logging, drainage problems' },
    { id: '5', type: 'waste_pileup', description: 'Garbage collection issues' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };


  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        // Create a FormData object for each file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', `reports/${user?.id || 'temp'}`);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      setFormData(prev => ({ ...prev, images: uploadedUrls }));
      setSelectedFiles([]);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter it manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please sign in to submit a report.');
      return;
    }

    if (!formData.title || !formData.description || !formData.issue_category_id || !formData.address) {
      setError('Please fill in all required fields.');
      return;
    }

    // Images are mandatory
    if (formData.images.length === 0) {
      setError('Please take at least one photo to document the issue.');
      return;
    }

    // If user selected files, they need to be uploaded first
    if (selectedFiles.length > 0) {
      setError('Please upload the selected photos before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          issue_category_id: formData.issue_category_id,
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0,
          address: formData.address,
          images: formData.images
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'DUPLICATE_REPORT') {
          setError(errorData.error);
          return;
        }
        throw new Error(errorData.error || 'Failed to submit report');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
            <p className="text-white/80 mb-6">Please sign in to submit a report.</p>
            <Button onClick={() => router.push('/sign-in')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Report Submitted!</h2>
            <p className="text-white/80 mb-6">Your report has been submitted successfully and is under review.</p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            className="glass-effect hover:bg-primary/20 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold hero-text">Report an Issue</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Issue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                      <p className="text-red-400">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Issue Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Brief description of the issue"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide detailed information about the issue..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">Issue Category *</Label>
                  <Select value={formData.issue_category_id} onValueChange={(value) => handleInputChange('issue_category_id', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">Location Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter the exact location of the issue"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-foreground">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      placeholder="e.g., 28.6139"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-foreground">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      placeholder="e.g., 77.2090"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <Button
                    type="button"
                    onClick={handleLocationClick}
                    variant="outline"
                    className="glass-effect hover:bg-primary/20 border-white/20 text-white"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Use Current Location
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Photos (Required) *</Label>
                  
                  {/* Camera Input - Camera Only */}
                  <input
                    type="file"
                    id="camera-capture"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white/70 mb-4">Take photos to document the issue</p>
                    
                    <div className="flex gap-2 justify-center flex-wrap">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="glass-effect hover:bg-primary/20 border-white/20 text-white"
                        onClick={() => document.getElementById('camera-capture')?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                      
                      {selectedFiles.length > 0 && (
                        <Button 
                          type="button" 
                          onClick={handleImageUpload}
                          disabled={uploadingImages}
                          className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                        >
                          {uploadingImages ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xs text-white/50 mt-2">Camera only - No gallery or file uploads allowed</p>
                    
                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-white/70 mb-2">Selected files:</p>
                        <div className="space-y-1">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="text-xs text-white/60">
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Uploaded Images Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-white/70 mb-2">Uploaded images:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={imageUrl} 
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded border border-white/20"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 glass-effect hover:bg-primary/20 border-white/20 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ReportPage;