"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Trophy, FileText, Edit3, Award, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, X, Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useUser as useDbUser } from "@/hooks/use-user";
import { Report } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/status-badge";

// Wrapper component to handle Clerk availability
const ProfileWrapper = () => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkAvailable = publishableKey && publishableKey !== 'pk_test_placeholder';

  if (!isClerkAvailable) {
    // During build time, render a simple version
    return (
      <div className="min-h-screen gradient-bg relative overflow-hidden">
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
        <main className="relative z-10 container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold hero-text mb-8">My Profile</h1>
          <p className="text-white/80">Loading...</p>
        </main>
      </div>
    );
  }

  return <ProfileContent />;
};

const ProfileContent = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user: clerkUser, isLoaded } = useUser();
  const { user: dbUser, loading: userLoading } = useDbUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (dbUser) {
      fetchUserReports();
    }
  }, [dbUser]);

  const fetchUserReports = async () => {
    try {
      setReportsLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      // Filter to only show user's own reports
      const userReports = data.reports?.filter((report: Report) => 
        report.user?.clerk_id === clerkUser?.id
      ) || [];
      setReports(userReports);
    } catch (err) {
      console.error('Error fetching user reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut(() => router.push('/'));
  };

  // Show loading state
  if (!isLoaded || userLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/80">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!clerkUser || !dbUser) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
            <p className="text-white/80 mb-6">Please sign in to view your profile.</p>
            <Button onClick={() => router.push('/sign-in')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userStats = {
    honorPoints: dbUser.honor_score_points,
    totalReports: reports.length,
    resolvedReports: reports.filter(r => r.verification_status === 'verified').length,
    pendingReports: reports.filter(r => r.verification_status === 'pending').length,
    rejectedReports: reports.filter(r => r.verification_status === 'rejected').length,
    communityRank: 1, // This would need to be calculated from leaderboard
    joinDate: new Date(dbUser.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  };

  const recentReports = reports.slice(0, 5);

  const honorPointsHistory = [
    { date: '2025-09-01', points: 50, reason: 'Street Light Report Verified', type: 'earned' },
    { date: '2025-08-25', points: 75, reason: 'Garbage Collection Issue Resolved', type: 'earned' },
    { date: '2025-08-15', points: 100, reason: 'Traffic Signal Report', type: 'earned' },
    { date: '2025-08-10', points: 25, reason: 'Quick Response Bonus', type: 'earned' },
    { date: '2025-08-05', points: 60, reason: 'Community Impact Achievement', type: 'earned' },
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
      case "verified":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
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
        <div className="flex items-center gap-4">
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
            className="glass-effect hover:bg-red-500/20 border-red-400/50 text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4 mr-2" />
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
                  <span className="text-2xl font-bold text-primary-foreground">
                    {dbUser.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{dbUser.full_name}</h2>
                  <p className="text-white/90">{dbUser.email}</p>
                  <div className="flex items-center mt-2">
                    <Calendar className="h-4 w-4 mr-2 text-white/70" />
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
              <p className="text-3xl font-bold text-primary">{userStats.honorPoints}</p>
              <p className="text-sm text-white/90">Rank #{userStats.communityRank}</p>
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
              <p className="text-3xl font-bold text-secondary">{userStats.totalReports}</p>
              <p className="text-sm text-white/90">All time submissions</p>
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
              <p className="text-3xl font-bold text-success">{userStats.resolvedReports}</p>
              <p className="text-sm text-white/90">
                {userStats.totalReports > 0 
                  ? Math.round((userStats.resolvedReports / userStats.totalReports) * 100)
                  : 0}% success rate
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
              <p className="text-3xl font-bold text-accent">{userAchievements.length}</p>
              <p className="text-sm text-white/90">Badges earned</p>
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
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span className="text-white/80">Loading reports...</span>
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-white/80 mb-4">You haven&apos;t submitted any reports yet.</p>
                  <Button onClick={() => router.push("/report")} className="bg-gradient-primary">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Your First Report
                  </Button>
                </div>
              ) : (
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
                          {getStatusIcon(report.verification_status)}
                          <h3 className="font-semibold text-foreground">{report.title}</h3>
                          <StatusBadge 
                            status={report.verification_status} 
                            type="verification" 
                          />
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-white/70">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {report.address}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {report.issue_category?.type || 'Unknown'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
                            <p className="text-sm text-white/70">{entry.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">+{entry.points}</p>
                            <Star className="h-4 w-4 text-accent inline" />
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
                    {reports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-border/50 rounded-lg bg-card/50 hover:bg-card/70 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{report.title}</h3>
                          <StatusBadge 
                            status={report.verification_status} 
                            type="verification" 
                          />
                        </div>
                        <p className="text-sm text-white/80 mb-2">{report.description}</p>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {report.address}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <span className="text-foreground font-medium">
                              {report.issue_category?.type || 'Unknown'}
                            </span>
                          </div>
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
                    {reports.filter(report => report.verification_status === 'verified').map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-success/30 rounded-lg bg-success/10"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{report.title}</h3>
                          <StatusBadge 
                            status="verified" 
                            type="verification" 
                          />
                        </div>
                        <p className="text-sm text-white/80 mb-2">{report.description}</p>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {report.address}
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-accent" />
                            +50 pts earned
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
                        className="p-4 border border-accent/30 rounded-lg bg-accent/10 text-center"
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
    </div>
  );
};

export default ProfileWrapper;