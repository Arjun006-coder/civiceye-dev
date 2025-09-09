'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Report } from "@/lib/supabase";
import { MapPin, Calendar, Image as ImageIcon, X, Eye } from "lucide-react";
import { useState } from "react";

interface ReportDetailsDialogProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDetailsDialog({ report, isOpen, onClose }: ReportDetailsDialogProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!report) return null;

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

  const images = report.images && Array.isArray(report.images) ? report.images : [];
  const hasImages = images.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center">
              <Eye className="h-6 w-6 mr-2 text-primary" />
              Report Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Title and Status */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-foreground pr-4">
                {report.title}
              </h2>
              <Badge className={getStatusColor(report.verification_status)}>
                {getStatusLabel(report.verification_status)}
              </Badge>
            </div>
            
            {report.description && (
              <p className="text-white/80 leading-relaxed">
                {report.description}
              </p>
            )}
          </div>

          {/* Location Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Location
            </h3>
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <p className="text-white/90 font-medium">{report.address}</p>
              <div className="flex items-center text-sm text-white/70">
                <span className="mr-4">
                  <strong>Latitude:</strong> {report.latitude?.toFixed(6)}
                </span>
                <span>
                  <strong>Longitude:</strong> {report.longitude?.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          {/* Report Images */}
          {hasImages && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                Photos ({images.length})
              </h3>
              
              <div className="space-y-4">
                {/* Main Image Display */}
                <div className="relative bg-white/5 rounded-lg overflow-hidden">
                  <img
                    src={images[selectedImageIndex]}
                    alt={`Report image ${selectedImageIndex + 1}`}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg px-3 py-1 text-white text-sm">
                      {selectedImageIndex + 1} of {images.length}
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index
                            ? 'border-primary'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Report Metadata */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Report Information
            </h3>
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/70 mb-1">Report ID</p>
                  <p className="text-white/90 font-mono text-sm">{report.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-white/70 mb-1">Submitted</p>
                  <p className="text-white/90">
                    {new Date(report.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {report.issue_category && (
                  <div>
                    <p className="text-sm text-white/70 mb-1">Issue Category</p>
                    <p className="text-white/90">{report.issue_category.type}</p>
                  </div>
                )}

                {report.final_confidence_score && (
                  <div>
                    <p className="text-sm text-white/70 mb-1">Confidence Score</p>
                    <p className="text-white/90">
                      {Math.round(report.final_confidence_score * 100)}%
                    </p>
                  </div>
                )}
              </div>

              {report.admin_notes && (
                <div>
                  <p className="text-sm text-white/70 mb-1">Admin Notes</p>
                  <p className="text-white/90 bg-white/5 rounded p-2 text-sm">
                    {report.admin_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

