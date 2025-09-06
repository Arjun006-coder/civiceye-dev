'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Footer } from "@/components/Footer";

const Report = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issueType: "",
    location: "",
    latitude: "",
    longitude: "",
    photo: null as File | null
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const issueTypes = [
    "Road Damage",
    "Street Lights",
    "Traffic Lights",
    "Noise",
    "Water/ Drainage System",
    "Waste Pileup",
    "Public Transport"
  ];

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        });
        setIsGettingLocation(false);
        toast({
          title: "Location captured",
          description: "Your current location has been set",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Location access denied",
          description: "Please allow location access or enter location manually",
          variant: "destructive"
        });
      }
    );
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      toast({
        title: "Photo captured",
        description: `Photo taken successfully`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including location",
        variant: "destructive"
      });
      return;
    }

    // Simulate report submission
    toast({
      title: "Report Submitted!",
      description: "Your report has been submitted successfully",
    });

    // Navigate back to dashboard after successful submission
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center p-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="glass-effect hover:bg-primary/20 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold hero-text">Submit Report</h1>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">
                Report a Civic Issue
              </CardTitle>
              <p className="text-muted-foreground">
                Help improve your community by reporting issues that need attention
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload - Camera Only */}
                <div className="space-y-2">
                  <Label htmlFor="photo" className="text-foreground">
                    Photo Evidence
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCameraCapture}
                      className="hidden"
                    />
                    <label htmlFor="photo" className="cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        {formData.photo ? (
                          <>
                            <Camera className="h-8 w-8 text-primary" />
                            <p className="text-foreground">Photo captured successfully</p>
                            <p className="text-sm text-muted-foreground">Click to take another photo</p>
                          </>
                        ) : (
                          <>
                            <Camera className="h-8 w-8 text-muted-foreground" />
                            <p className="text-foreground">Click to take a photo</p>
                            <p className="text-sm text-muted-foreground">
                              Camera access required
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">
                    Report Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                </div>

                {/* Issue Type */}
                <div className="space-y-2">
                  <Label htmlFor="issueType" className="text-foreground">
                    Issue Type
                  </Label>
                  <Select
                    value={formData.issueType}
                    onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select issue category (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {issueTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-foreground">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location - Auto Get Only */}
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Location *
                  </Label>
                  <div className="space-y-3">
                    {formData.location ? (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={formData.location}
                          className="bg-input border-border text-foreground pl-10"
                          readOnly
                        />
                      </div>
                    ) : (
                      <div className="text-center p-4 border border-dashed border-border rounded-lg">
                        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Location not captured yet</p>
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground"
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Get My Location
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue, including when you noticed it and how it affects the community..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-input border-border text-foreground min-h-32"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-xl"
                >
                  Submit Report
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Report;