'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, AlertTriangle, TrendingUp, Loader2, BarChart3, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Report } from "@/lib/supabase";
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
});

const Heatmaps = () => {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/heatmap-mock');
      if (!response.ok) throw new Error('Failed to fetch heatmap data');
      
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return "bg-gradient-to-r from-green-500 to-green-700";
      case 'under_review':
        return "bg-gradient-to-r from-blue-500 to-blue-700";
      case 'pending':
        return "bg-gradient-to-r from-yellow-500 to-yellow-700";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return "Verified";
      case 'under_review':
        return "Under Review";
      case 'pending':
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return "bg-red-500";
    if (intensity >= 0.6) return "bg-orange-500";
    if (intensity >= 0.4) return "bg-yellow-500";
    if (intensity >= 0.2) return "bg-green-500";
    return "bg-blue-500";
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 0.8) return "Very High";
    if (intensity >= 0.6) return "High";
    if (intensity >= 0.4) return "Medium";
    if (intensity >= 0.2) return "Low";
    return "Very Low";
  };

  const stats = {
    totalReports: reports.length,
    verifiedReports: reports.filter(r => r.verification_status === 'verified').length,
    underReviewReports: reports.filter(r => r.verification_status === 'under_review').length,
    pendingReports: reports.filter(r => r.verification_status === 'pending').length,
    avgConfidence: reports.length > 0 
      ? reports.reduce((sum, r) => sum + (r.final_confidence_score || 0), 0) / reports.length 
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/80">Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading Data</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <Button onClick={fetchHeatmapData} className="w-full">
              Try Again
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
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="glass-effect hover:bg-primary/20 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold hero-text">Report Heatmaps</h1>
        </div>
        <Button
          onClick={() => setShowMap(!showMap)}
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
        >
          <Layers className="h-4 w-4 mr-2" />
          {showMap ? 'Show Stats' : 'Show Map'}
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {showMap ? (
          /* Map View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-[calc(100vh-200px)]"
          >
            <Card className="glass-effect h-full">
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Interactive Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <MapComponent reports={reports} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Stats View */
          <>
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
            >
              <Card className="glass-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-foreground">
                    <MapPin className="h-5 w-5 mr-2 text-vibrant-blue" />
                    Total Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-vibrant-blue">{stats.totalReports}</p>
                  <p className="text-white/80">All locations</p>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-foreground">
                    <BarChart3 className="h-5 w-5 mr-2 text-vibrant-green" />
                    Verified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-vibrant-green">{stats.verifiedReports}</p>
                  <p className="text-white/80">Confirmed issues</p>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-foreground">
                    <TrendingUp className="h-5 w-5 mr-2 text-vibrant-orange" />
                    Auto Verified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-vibrant-orange">{stats.autoVerifiedReports}</p>
                  <p className="text-white/80">AI confirmed</p>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-foreground">
                    <AlertTriangle className="h-5 w-5 mr-2 text-vibrant-yellow" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-vibrant-yellow">{stats.pendingReports}</p>
                  <p className="text-white/80">Under review</p>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-foreground">
                    <BarChart3 className="h-5 w-5 mr-2 text-vibrant-cyan" />
                    Avg Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-vibrant-cyan">{Math.round(stats.avgConfidence * 100)}%</p>
                  <p className="text-white/80">AI accuracy</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Reports */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-white/80 mb-4">No reports available for heatmap visualization.</p>
                      <Button onClick={() => router.push("/report")} className="bg-gradient-primary">
                        <MapPin className="h-4 w-4 mr-2" />
                        Submit First Report
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.slice(0, 10).map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-foreground">{report.title}</h3>
                              <Badge className={getStatusColor(report.verification_status)}>
                                {getStatusLabel(report.verification_status)}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-white/70">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {report.address}
                              </div>
                              <div className="flex items-center">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                {Math.round((report.final_confidence_score || 0) * 100)}% confidence
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`w-4 h-4 rounded-full ${getIntensityColor(report.final_confidence_score || 0)}`}></div>
                            <p className="text-xs text-white/70 mt-1">
                              {getIntensityLabel(report.final_confidence_score || 0)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default Heatmaps;