"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Trophy, FileText, Edit3, Award, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, X, Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useUser as useDbUser } from "@/hooks/use-user";
import { Report } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/status-badge";
import { Footer } from "@/components/Footer";

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

  const fetchUserReports = async () => {
    try {
      setReportsLoading(true);
      const response = await fetch('/api/reports');
      // If signed out or unauthorized, just stop and clear
      if (response.status === 401) {
        setReports([]);
        return;
      }
      if (!response.ok) {
        setReports([]);
        return;
      }
      
      const data = await response.json();
      // Filter to only show user's own reports
      const userReports = data.reports?.filter((report: Report) => 
        report.user?.clerk_id === clerkUser?.id
      ) || [];
      setReports(userReports);
    } catch (err) {
      // Swallow errors during sign-out/navigation races
      console.warn('Non-fatal: Error fetching user reports:', err);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (dbUser) {
      fetchUserReports();
    }
  }, [dbUser, clerkUser?.id]);

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
    verifiedReports: reports.filter(r => r.verification_status === 'verified').length,
    pendingReports: reports.filter(r => r.verification_status === 'pending').length,
    rejectedReports: reports.filter(r => r.verification_status === 'rejected').length,
    communityRank: 1, // This would need to be calculated from leaderboard
    joinDate: new Date(dbUser.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  };

  const recentReports = reports.slice(0, 5);

  // Generate honor points history from actual verified reports
  const honorPointsHistory = reports
    .filter(report => report.verification_status === 'verified')
    .map(report => ({
      date: new Date(report.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      points: 5, // 5 points per verified report
      reason: `${report.title} - Verified`,
      type: 'earned' as const
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Show last 10 entries

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
      <header className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="glass-effect hover:bg-primary/20 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold hero-text">My Profile</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button
            onClick={() => router.push("/edit-profile")}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground w-full sm:w-auto"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="glass-effect hover:bg-red-500/20 border-red-400/50 text-red-400 hover:text-red-300 w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
                <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-gradient-primary">
                  {dbUser.profile_pic_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dbUser.profile_pic_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary-foreground">
                      {dbUser.full_name?.charAt(0) || 'U'}
                    </span>
                  )}
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8"
        >
          <Card
            className="glass-effect cursor-pointer hover:scale-105 transition-transform border-orange-400/30"
            onClick={() => setActiveModal('honor-points')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Trophy className="h-5 w-5 mr-2 text-orange-400" />
                Honor Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-400">{userStats.honorPoints}</p>
              <p className="text-sm text-white/90">Rank #{userStats.communityRank}</p>
            </CardContent>
          </Card>

          <Card
            className="glass-effect cursor-pointer hover:scale-105 transition-transform border-blue-400/30"
            onClick={() => setActiveModal('total-reports')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-400">{userStats.totalReports}</p>
              <p className="text-sm text-white/90">All time submissions</p>
            </CardContent>
          </Card>

          <Card
            className="glass-effect cursor-pointer hover:scale-105 transition-transform border-green-400/30"
            onClick={() => setActiveModal('verified-reports')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                Verified Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">{userStats.verifiedReports}</p>
              <p className="text-sm text-white/90">Successfully verified</p>
            </CardContent>
          </Card>

          <Card
            className="glass-effect cursor-pointer hover:scale-105 transition-transform border-purple-400/30"
            onClick={() => setActiveModal('success-rate')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <CheckCircle className="h-5 w-5 mr-2 text-purple-400" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-400">
                {userStats.totalReports > 0 
                  ? Math.round((userStats.verifiedReports / userStats.totalReports) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-white/90">Verification success rate</p>
            </CardContent>
          </Card>

          <Card
            className="glass-effect cursor-pointer hover:scale-105 transition-transform border-yellow-400/30"
            onClick={() => setActiveModal('reputation')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Star className="h-5 w-5 mr-2 text-yellow-400" />
                Reputation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-400">{dbUser.reputation || 0}</p>
              <p className="text-sm text-white/90">Community standing</p>
            </CardContent>
          </Card>

          <Card
            className="glass-effect cursor-pointer hover:scale-105 transition-transform border-orange-400/30"
            onClick={() => setActiveModal('achievements')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Award className="h-5 w-5 mr-2 text-orange-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-400">{userAchievements.length}</p>
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
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <Trophy className="mr-2 h-6 w-6 text-orange-400" />
                      Honor Points History
                    </h2>
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
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <FileText className="mr-2 h-6 w-6 text-blue-400" />
                      All My Reports
                    </h2>
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

          {activeModal === 'verified-reports' && (
            <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-effect">
                <DialogTitle className="sr-only">Verified Reports</DialogTitle>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <CheckCircle className="mr-2 h-6 w-6 text-green-400" />
                      Verified Reports
                    </h2>
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
                            +5 pts earned
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {activeModal === 'success-rate' && (
            <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-effect">
                <DialogTitle className="sr-only">Success Rate Details</DialogTitle>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <CheckCircle className="mr-2 h-6 w-6 text-purple-400" />
                      Success Rate Details
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-6 border border-accent/30 rounded-lg bg-accent/10 text-center">
                      <div className="text-4xl font-bold text-accent mb-2">
                        {userStats.totalReports > 0 
                          ? Math.round((userStats.verifiedReports / userStats.totalReports) * 100)
                          : 0}%
                      </div>
                      <p className="text-white/90 font-medium">Verification Success Rate</p>
                      <p className="text-sm text-white/70 mt-2">
                        {userStats.verifiedReports} out of {userStats.totalReports} reports verified
                      </p>
                    </div>
                    
                  <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Report Status Breakdown</h3>
                      <div className="space-y-2 text-sm text-white/80">
                        <div className="flex justify-between">
                          <span>Verified Reports:</span>
                          <span className="text-green-400">{userStats.verifiedReports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending Reports:</span>
                          <span className="text-yellow-400">{userStats.pendingReports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rejected Reports:</span>
                          <span className="text-red-400">{userStats.rejectedReports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Reports:</span>
                          <span className="text-white">{userStats.totalReports}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {activeModal === 'reputation' && (
            <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-effect">
                <DialogTitle className="sr-only">Reputation Details</DialogTitle>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <Star className="mr-2 h-6 w-6 text-yellow-400" />
                      Reputation Details
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-6 border border-yellow-400/30 rounded-lg bg-yellow-400/10 text-center">
                      <div className="text-4xl font-bold text-yellow-400 mb-2">
                        {dbUser.reputation || 0}
                      </div>
                      <p className="text-white/90 font-medium">Current Reputation Score</p>
                      <p className="text-sm text-white/70 mt-2">
                        Your reputation is based on verified reports and community contributions
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">How Reputation Works</h3>
                      <div className="space-y-2 text-sm text-white/80">
                        <div className="flex justify-between">
                          <span>Verified Report:</span>
                          <span className="text-green-400">+0.5 points</span>
                          </div>
                        <div className="flex justify-between">
                          <span>High Quality Report:</span>
                          <span className="text-green-400">+1.0 points</span>
                          </div>
                        <div className="flex justify-between">
                          <span>Community Impact:</span>
                          <span className="text-green-400">+2.0 points</span>
                        </div>
                      </div>
                    </div>
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
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <Award className="mr-2 h-6 w-6 text-orange-400" />
                      My Achievements
                    </h2>
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
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProfileWrapper;