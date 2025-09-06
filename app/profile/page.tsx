'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Trophy, 
  FileText, 
  Edit3, 
  Award,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  LogOut,
  X,
  Star
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Footer } from "@/components/Footer";

const Profile = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleSignOut = () => {
    // Sign out using Clerk
    signOut(() => router.push('/'));
  };

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
          <p className="text-white/80">Please wait while we load your profile</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-white/80 mb-6">You need to be signed in to view your profile</p>
          <Button
            onClick={() => router.push('/sign-in')}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const userStats = {
    honorPoints: 450,
    totalReports: 12,
    resolvedReports: 8,
    pendingReports: 3,
    rejectedReports: 1,
    communityRank: 23,
    joinDate: "March 2024"
  };

  const recentReports = [
    {
      id: 1,
      title: "Broken Street Light on Main St",
      status: "resolved",
      date: "2025-09-01",
      points: 50,
      location: "Main Street, Downtown"
    },
    {
      id: 2,
      title: "Pothole on Park Avenue",
      status: "pending",
      date: "2025-08-28",
      points: 0,
      location: "Park Avenue, Block 5"
    },
    {
      id: 3,
      title: "Garbage Collection Issue",
      status: "resolved",
      date: "2025-08-25",
      points: 75,
      location: "Residential Area, Zone 3"
    },
    {
      id: 4,
      title: "Water Leakage in Public Park",
      status: "pending",
      date: "2025-08-20",
      points: 0,
      location: "Central Park"
    },
    {
      id: 5,
      title: "Traffic Signal Malfunction",
      status: "resolved",
      date: "2025-08-15",
      points: 100,
      location: "Market Square Intersection"
    }
  ];

  const honorPointsHistory = [
    { date: '2025-09-01', points: 50, reason: 'Street Light Report Verified', type: 'earned' },
    { date: '2025-08-25', points: 75, reason: 'Garbage Collection Issue Resolved', type: 'earned' },
    { date: '2025-08-15', points: 100, reason: 'Traffic Signal Report', type: 'earned' },
    { date: '2025-08-10', points: 25, reason: 'Quick Response Bonus', type: 'earned' },
    { date: '2025-08-05', points: 60, reason: 'Community Impact Achievement', type: 'earned' },
  ];

  const allReports = [
    { id: 1, title: 'Broken Street Light on Main St', location: 'Main Street, Downtown', date: '2025-09-01', status: 'resolved', points: 50, description: 'Street light has been flickering for weeks' },
    { id: 2, title: 'Pothole on Park Avenue', location: 'Park Avenue, Block 5', date: '2025-08-28', status: 'pending', points: 0, description: 'Large pothole causing traffic issues' },
    { id: 3, title: 'Garbage Collection Issue', location: 'Residential Area, Zone 3', date: '2025-08-25', status: 'resolved', points: 75, description: 'Missed garbage collection for two weeks' },
    { id: 4, title: 'Water Leakage in Public Park', location: 'Central Park', date: '2025-08-20', status: 'pending', points: 0, description: 'Water pipe burst in the park area' },
    { id: 5, title: 'Traffic Signal Malfunction', location: 'Market Square Intersection', date: '2025-08-15', status: 'resolved', points: 100, description: 'Traffic light stuck on red' },
  ];

  const userAchievements = [
    { title: 'First Reporter', description: 'Submitted your first report', icon: '🎯', date: '2024-03-01' },
    { title: 'Community Hero', description: 'Earned 400+ honor points', icon: '🦸‍♀️', date: '2024-08-01' },
    { title: 'Problem Solver', description: '5 reports resolved', icon: '🔧', date: '2024-07-15' },
    { title: 'Speed Demon', description: 'Report resolved in under 24 hours', icon: '⚡', date: '2024-09-01' },
    { title: 'Eagle Eye', description: 'High accuracy rate on reports', icon: '👁️', date: '2024-08-20' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-gradient-to-r from-green-400 to-green-600 text-white border-green-300";
      case "pending":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300";
      case "rejected":
        return "bg-gradient-to-r from-red-400 to-red-600 text-white border-red-300";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-300";
    }
  };

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
          <h1 className="text-3xl font-bold hero-text">My Profile</h1>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => router.push("/edit-profile")}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">JD</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">John Doe</h2>
                  <p className="text-white/80">john.doe@email.com</p>
                  <div className="flex items-center mt-2">
                    <Calendar className="h-4 w-4 mr-2 text-white/60" />
                    <span className="text-sm text-white/70">
                      Member since {userStats.joinDate}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card 
            className="glass-effect cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setActiveModal('honor-points')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Trophy className="h-5 w-5 mr-2 text-primary" />
                Honor Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-vibrant-yellow">{userStats.honorPoints}</p>
              <p className="text-sm text-white/90 font-medium">Rank #{userStats.communityRank}</p>
            </CardContent>
          </Card>

          <Card 
            className="glass-effect cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setActiveModal('total-reports')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <FileText className="h-5 w-5 mr-2 text-secondary" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-vibrant-blue">{userStats.totalReports}</p>
              <p className="text-sm text-white/90 font-medium">All time submissions</p>
            </CardContent>
          </Card>

          <Card 
            className="glass-effect cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setActiveModal('resolved-reports')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <CheckCircle className="h-5 w-5 mr-2 text-success" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-vibrant-green">{userStats.resolvedReports}</p>
              <p className="text-sm text-white/90 font-medium">
                {Math.round((userStats.resolvedReports / userStats.totalReports) * 100)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card 
            className="glass-effect cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setActiveModal('achievements')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Award className="h-5 w-5 mr-2 text-accent" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-vibrant-purple">5</p>
              <p className="text-sm text-white/90 font-medium">Badges earned</p>
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
              <CardTitle className="text-xl text-foreground">My Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(report.status)}
                        <h3 className="font-semibold text-foreground">{report.title}</h3>
                        <Badge className={`${getStatusColor(report.status)}`}>
                          {report.status}
                        </Badge>
                      </div>
                        <div className="flex items-center space-x-4 text-sm text-white/70">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {report.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(report.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-vibrant-orange">
                        {report.points > 0 ? `+${report.points}` : "0"} pts
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {activeModal === 'honor-points' && (
            <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-effect">
                <DialogTitle className="sr-only">Honor Points History</DialogTitle>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground flex items-center">
                      <Trophy className="mr-2 h-6 w-6 text-primary" />
                      Honor Points History
                    </h2>
                    <Button variant="ghost" onClick={() => setActiveModal(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {honorPointsHistory.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-border/50 rounded-lg bg-card/50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-foreground">{entry.reason}</p>
                            <p className="text-sm text-white/80">{entry.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-vibrant-yellow">+{entry.points}</p>
                            <Star className="h-4 w-4 text-vibrant-orange inline" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {activeModal === 'total-reports' && (
            <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-effect">
                <DialogTitle className="sr-only">All My Reports</DialogTitle>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground flex items-center">
                      <FileText className="mr-2 h-6 w-6 text-secondary" />
                      All My Reports
                    </h2>
                    <Button variant="ghost" onClick={() => setActiveModal(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {allReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-border/50 rounded-lg bg-card/50 hover:bg-card/70 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{report.title}</h3>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status.replace('-', ' ')}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-white/80 mb-2">{report.description}</p>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {report.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {report.date}
                          </div>
                          {report.points > 0 && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-vibrant-orange" />
                              +{report.points} pts
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {activeModal === 'resolved-reports' && (
            <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-effect">
                <DialogTitle className="sr-only">Resolved Reports</DialogTitle>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground flex items-center">
                      <CheckCircle className="mr-2 h-6 w-6 text-success" />
                      Resolved Reports
                    </h2>
                    <Button variant="ghost" onClick={() => setActiveModal(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {allReports.filter(report => report.status === 'resolved').map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-green-300/30 rounded-lg bg-gradient-to-r from-green-400/10 to-green-600/10"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{report.title}</h3>
                          <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        </div>
                        <p className="text-sm text-white/80 mb-2">{report.description}</p>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {report.location}
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-vibrant-orange" />
                            +{report.points} pts earned
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {activeModal === 'achievements' && (
            <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-effect">
                <DialogTitle className="sr-only">My Achievements</DialogTitle>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground flex items-center">
                      <Award className="mr-2 h-6 w-6 text-accent" />
                      My Achievements
                    </h2>
                    <Button variant="ghost" onClick={() => setActiveModal(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userAchievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-purple-300/30 rounded-lg bg-gradient-to-r from-purple-400/10 to-purple-600/10 text-center"
                      >
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h3 className="font-semibold text-foreground mb-1">{achievement.title}</h3>
                        <p className="text-sm text-white/80 mb-2">{achievement.description}</p>
                        <p className="text-xs text-white/70">Earned: {achievement.date}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;