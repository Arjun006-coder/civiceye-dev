"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
  Image as ImageIcon
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  description: string;
  issueType: string;
  location: string;
  status: "pending" | "verified" | "rejected";
  confidenceScore: number;
  reportedAt: string;
  municipality: string;
  municipalityHandling: boolean;
  image?: string;
  reporterName: string;
}

const AdminReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [issueTypeFilter, setIssueTypeFilter] = useState("all");

  // Mock report data
  const mockReports: Report[] = [
    {
      id: "1",
      title: "Broken Street Light on Main Avenue",
      description: "Street light has been flickering for weeks and now completely stopped working. Creating safety concerns for pedestrians.",
      issueType: "Street Lighting",
      location: "Main Avenue, Downtown",
      status: "pending",
      confidenceScore: 85,
      reportedAt: "2024-01-15",
      municipality: "Downtown Municipal Corp",
      municipalityHandling: false,
      image: "/placeholder-image.jpg",
      reporterName: "John Doe"
    },
    {
      id: "2",
      title: "Pothole on Central Road",
      description: "Large pothole causing vehicle damage and traffic delays. Urgent repair needed.",
      issueType: "Road Damage",
      location: "Central Road, Midtown",
      status: "verified",
      confidenceScore: 92,
      reportedAt: "2024-01-14",
      municipality: "Midtown Authority",
      municipalityHandling: true,
      reporterName: "Jane Smith"
    },
    {
      id: "3",
      title: "Overflowing Garbage Bins",
      description: "Garbage collection missed for over a week. Bins overflowing and creating health hazards.",
      issueType: "Waste Management",
      location: "Oak Street, Uptown",
      status: "rejected",
      confidenceScore: 45,
      reportedAt: "2024-01-13",
      municipality: "Uptown Services",
      municipalityHandling: false,
      reporterName: "Mike Johnson"
    }
  ];

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesArea = areaFilter === "all" || report.location.toLowerCase().includes(areaFilter.toLowerCase());
    const matchesIssueType = issueTypeFilter === "all" || report.issueType === issueTypeFilter;
    
    return matchesSearch && matchesStatus && matchesArea && matchesIssueType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white border-yellow-300"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-vibrant-green";
    if (score >= 60) return "text-vibrant-orange";
    return "text-vibrant-red";
  };

  const handleVerifyReport = (reportId: string) => {
    console.log(`Verifying report ${reportId}`);
    // Backend integration will be added later
  };

  const handleRejectReport = (reportId: string) => {
    console.log(`Rejecting report ${reportId}`);
    // Backend integration will be added later
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="text-foreground">Report Management</CardTitle>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              <SelectItem value="downtown">Downtown</SelectItem>
              <SelectItem value="midtown">Midtown</SelectItem>
              <SelectItem value="uptown">Uptown</SelectItem>
            </SelectContent>
          </Select>

          <Select value={issueTypeFilter} onValueChange={setIssueTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Issue Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              <SelectItem value="Road Damage">Road Damage</SelectItem>
              <SelectItem value="Street Lighting">Street Lighting</SelectItem>
              <SelectItem value="Waste Management">Waste Management</SelectItem>
              <SelectItem value="Water Supply">Water Supply</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{report.title}</h3>
                    {getStatusBadge(report.status)}
                    <Badge className="bg-gradient-to-r from-purple-400 to-purple-600 text-white border-purple-300">
                      <Star className="w-3 h-3 mr-1" />
                      <span className="text-white font-medium">
                        {report.confidenceScore}%
                      </span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {report.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {report.reportedAt}
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/80 mt-2 line-clamp-2">
                    {report.description}
                  </p>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-effect">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">{report.title}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Report Image */}
                      {report.image && (
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground" />
                          <span className="ml-2 text-muted-foreground">Report Image</span>
                        </div>
                      )}

                      {/* Report Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-foreground">Report Information</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/70">Issue Type:</span>
                              <span className="text-foreground font-medium">{report.issueType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Location:</span>
                              <span className="text-foreground font-medium">{report.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Reported By:</span>
                              <span className="text-foreground font-medium">{report.reporterName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Date:</span>
                              <span className="text-foreground font-medium">{report.reportedAt}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3 text-foreground">Status & Confidence</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-white/70">Status:</span>
                              {getStatusBadge(report.status)}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white/70">Confidence Score:</span>
                              <span className={`font-medium ${getConfidenceColor(report.confidenceScore)}`}>
                                {report.confidenceScore}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white/70">Municipality Handling Status:</span>
                              <Badge variant={report.municipalityHandling ? "default" : "secondary"} className="ml-2">
                                {report.municipalityHandling ? "In Progress" : "Not Started"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Description */}
                      <div>
                        <h4 className="font-semibold mb-3 text-foreground">Description</h4>
                        <p className="text-sm text-white/80 leading-relaxed">{report.description}</p>
                      </div>

                      {/* Action Buttons */}
                      {report.status === "pending" && (
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
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminReports;