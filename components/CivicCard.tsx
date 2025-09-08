'use client';

import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, ClipboardCheck, TrendingUp, MessageSquare, Building2, Building } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

interface CivicCardProps {
  title: string;
  description: string;
  icon: string;
  index: number;
}

// Icon mapping object
const iconMap: Record<string, LucideIcon> = {
  ClipboardCheck,
  TrendingUp,
  MessageSquare,
  Building2,
  Building,
};

const getImageForTitle = (title: string) => {
  // Using placeholder images from Unsplash that relate to each civic function
  switch (title) {
    case "Report Issues":
      return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center";
    case "Track Progress":
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center";
    case "Community Forums":
      return "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop&crop=center";
    case "City Services":
      return "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&h=600&fit=crop&crop=center";
    default:
      return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center";
  }
};

const getCardDetails = (title: string) => {
  switch (title) {
    case "Report Issues":
      return {
        description: "Submit and track community problems with ease. Report potholes, broken streetlights, garbage issues, and more to help improve your neighborhood.",
        features: [
          "Real-time issue submission with photo uploads",
          "GPS location tracking for accurate reporting",
          "Status updates and resolution tracking",
          "Community voting on priority issues"
        ]
      };
    case "Track Progress":
      return {
        description: "Monitor the status of reported issues in real-time. See how your community's problems are being addressed by local authorities.",
        features: [
          "Live status updates on all reported issues",
          "Progress tracking with visual timelines",
          "Email and SMS notifications",
          "Performance metrics and analytics"
        ]
      };
    case "Community Forums":
      return {
        description: "Engage with neighbors and local government through our community discussion platform. Share ideas, discuss solutions, and build stronger communities.",
        features: [
          "Topic-based discussion threads",
          "Local government official participation",
          "Community polls and surveys",
          "Event announcements and coordination"
        ]
      };
    case "City Services":
      return {
        description: "Access municipal services and information in one place. Find city resources, submit service requests, and stay informed about local government.",
        features: [
          "Directory of all city services and departments",
          "Online service request submission",
          "City calendar and event listings",
          "Contact information for local officials"
        ]
      };
    default:
      return {
        description: "Join your community in making a difference through civic engagement and transparent governance.",
        features: [
          "Community-driven solutions",
          "Transparent governance",
          "Real-time updates and notifications"
        ]
      };
  }
};

export const CivicCard = ({ title, description, icon, index }: CivicCardProps) => {
  const Icon = iconMap[icon];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardDetails = getCardDetails(title);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsModalOpen(true);
  };

  const handleMouseLeave = () => {
    // small delay to allow moving the cursor from card to modal
    timeoutRef.current = setTimeout(() => {
      setIsModalOpen(false);
    }, 200);
  };

  const handleModalMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleModalMouseLeave = () => {
    setIsModalOpen(false);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
      >
        <div className="civic-card h-32 w-full cursor-pointer group">
          <div className="flex items-center justify-center h-full relative z-10">
            <h3 className="text-xl font-semibold text-white group-hover:text-blue-200 transition-colors duration-300 drop-shadow-lg">
              {title}
            </h3>
            {/* Hover indicator */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* Modal state indicator */}
            {isModalOpen && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Centered Modal Popup */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Modal Content */}
            <motion.div
              className="relative max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleModalMouseEnter}
              onMouseLeave={handleModalMouseLeave}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 z-10 text-white hover:text-blue-200 transition-colors p-2"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>

              {/* Image Section */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={getImageForTitle(title)}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Icon Overlay */}
                <div className="absolute bottom-4 left-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                    <Icon size={32} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 bg-white/5">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {title}
                </h2>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                  {cardDetails.description}
                </p>
                
                {/* Additional Details */}
                <div className="space-y-3">
                  {cardDetails.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        idx === 0 ? 'bg-blue-400' : 
                        idx === 1 ? 'bg-purple-400' : 
                        idx === 2 ? 'bg-pink-400' : 'bg-green-400'
                      }`}></div>
                      <span className="text-white/90">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="mt-8">
                  <Link href="/sign-in">
                    <button 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Get Started with {title}
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};