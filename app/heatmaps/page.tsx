'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";

const Heatmaps = () => {
  const router = useRouter();

  const areaData = [
    { area: "Downtown", reports: 45, status: "high", trend: "up", mainIssue: "Traffic & Parking" },
    { area: "Residential Zone A", reports: 23, status: "medium", trend: "down", mainIssue: "Road Maintenance" },
    { area: "Industrial District", reports: 38, status: "high", trend: "stable", mainIssue: "Air Quality" },
    { area: "Park Area", reports: 12, status: "low", trend: "up", mainIssue: "Lighting" },
    { area: "Commercial Center", reports: 31, status: "medium", trend: "up", mainIssue: "Waste Management" },
    { area: "University Campus", reports: 18, status: "low", trend: "stable", mainIssue: "Public Safety" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "bg-gradient-to-r from-red-400 to-red-600 text-white border-red-300";
      case "medium":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300";
      case "low":
        return "bg-gradient-to-r from-green-400 to-green-600 text-white border-green-300";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-300";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-success rotate-180" />;
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
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
        <h1 className="text-3xl font-bold hero-text">Report Heatmaps</h1>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold mb-4 hero-text">
            City Issue Visualization
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Analyze report density and trends across different areas of the city
          </p>
        </motion.div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Interactive City Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-border/50 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Interactive Heatmap
                  </h3>
                  <p className="text-white/80 max-w-md">
                    This interactive map will show report density across the city with color-coded zones. 
                    Backend integration required for real-time data visualization.
                  </p>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
                      <span className="text-sm text-white font-medium">High Activity</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
                      <span className="text-sm text-white font-medium">Medium Activity</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                      <span className="text-sm text-white font-medium">Low Activity</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Area Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Area Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {areaData.map((area, index) => (
                  <motion.div
                    key={area.area}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{area.area}</h3>
                        <Badge className={getStatusColor(area.status)}>
                          {area.status} activity
                        </Badge>
                      </div>
                      <p className="text-sm text-white/80">
                        Main issue: {area.mainIssue}
                      </p>
                    </div>
                    <div className="text-right flex items-center space-x-3">
                      <div>
                        <p className="font-bold text-vibrant-blue text-lg">{area.reports}</p>
                        <p className="text-xs text-white/80 font-medium">reports</p>
                      </div>
                      {getTrendIcon(area.trend)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-6 w-6 text-destructive mr-2" />
                    <span className="text-2xl font-bold text-vibrant-red">3</span>
                  </div>
                  <p className="text-sm text-white/90 font-medium">High Activity Areas</p>
                </div>

                <div className="text-center p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-primary mr-2" />
                    <span className="text-2xl font-bold text-vibrant-blue">167</span>
                  </div>
                  <p className="text-sm text-white/90 font-medium">Total Reports This Month</p>
                </div>

                <div className="text-center p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-secondary mr-2" />
                    <span className="text-2xl font-bold text-vibrant-green">28%</span>
                  </div>
                  <p className="text-sm text-white/90 font-medium">Increase from Last Month</p>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Trending Issues</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/80">Road Maintenance</span>
                      <span className="text-vibrant-orange font-medium">32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Traffic Issues</span>
                      <span className="text-vibrant-yellow font-medium">24%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Street Lighting</span>
                      <span className="text-vibrant-cyan font-medium">18%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Heatmaps;