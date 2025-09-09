"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfidenceScore } from "@/components/ui/confidence-score";
import { 
  Search, 
  Filter, 
  Eye, 
  MapPin, 
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { Report } from "@/lib/supabase";

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    try {
      const response = await fetch('/api/reports/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          status: 'verified',
          adminNotes: 'Verified by admin'
        })
      });

      if (response.ok) {
        await fetchReports(); // Refresh the list
        setSelectedReport(null);
      } else {
        throw new Error('Failed to verify report');
      }
    } catch (err) {
      console.error('Error verifying report:', err);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      const response = await fetch('/api/reports/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          status: 'rejected',
          adminNotes: 'Rejected by admin'
        })
      });

      if (response.ok) {
        await fetchReports(); // Refresh the list
        setSelectedReport(null);
      } else {
        throw new Error('Failed to reject report');
      }
    } catch (err) {
      console.error('Error rejecting report:', err);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const confirmed = window.confirm('Delete this report permanently? This cannot be undone.');
      if (!confirmed) return;

      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      await fetchReports();
      setSelectedReport(null);
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-white/80">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-4">Error loading reports: {error}</p>
        <Button onClick={fetchReports} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-white/80">No reports found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect hover:bg-white/10 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{report.title}</h3>
                        <StatusBadge 
                          status={report.verification_status} 
                          type="verification" 
                        />
                      </div>
                      
                      <p className="text-sm text-white/80 mb-4 line-clamp-2">
                        {report.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-white/70 mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {report.address}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {report.issue_category?.type || 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <ConfidenceScore 
                          score={report.final_confidence_score || 0} 
                          className="text-white/70"
                        />
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/70">Reporter:</span>
                          <span className="text-foreground font-medium">
                            {report.user?.full_name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[rgba(15,23,42,0.7)] bg-gradient-to-br from-[rgba(17,24,39,0.75)] to-[rgba(2,6,23,0.6)] backdrop-blur-md border border-white/10 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-white">{report.title}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Report Image */}
                            {report.images && report.images.length > 0 ? (
                              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={report.images[0]}
                                  alt={report.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">No Image</span>
                              </div>
                            )}

                            {/* Report Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3 text-white">Report Information</h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-blue-200/90">Issue Type:</span>
                                    <span className="text-white font-medium">
                                      {report.issue_category?.type || 'Unknown'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-200/90">Location:</span>
                                    <span className="text-white font-medium">{report.address}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-200/90">Reported By:</span>
                                    <span className="text-white font-medium">
                                      {report.user?.full_name || 'Unknown'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-200/90">Reporter Email:</span>
                                    <span className="text-white font-medium">
                                      {report.user?.email || 'Unknown'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-200/90">Reporter Reputation:</span>
                                    <span className="text-white font-medium">
                                      {report.user?.reputation || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-200/90">Reporter Honor Points:</span>
                                    <span className="text-white font-medium">
                                      {report.user?.honor_score_points || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-200/90">Date:</span>
                                    <span className="text-white font-medium">
                                      {new Date(report.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-3 text-white">Status & Confidence</h4>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-blue-200/90">Status:</span>
                                    <StatusBadge 
                                      status={report.verification_status} 
                                      type="verification" 
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <ConfidenceScore 
                                      score={report.final_confidence_score || 0} 
                                      className="text-blue-200/90"
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-blue-200/90">Municipality Handling Status:</span>
                                    <Badge variant="secondary" className="ml-2">
                                      Not Started
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Description */}
                            <div>
                              <h4 className="font-semibold mb-3 text-white">Description</h4>
                              <p className="text-sm text-white/90 leading-relaxed">{report.description}</p>
                            </div>

                            {/* Action Buttons */}
                            {report.verification_status === "pending" && (
                              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                                <Button 
                                  onClick={() => handleVerifyReport(report.id)}
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Verify Report
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleRejectReport(report.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject Report
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                                >
                                  Delete Report
                                </Button>
                              </div>
                            )}
                            {report.verification_status !== "pending" && (
                              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                                >
                                  Delete Report
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}