'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle, 
  Trophy, 
  MapPin, 
  User, 
  BarChart3,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Report } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/status-badge";

const UserDashboard = () => {
  const router = useRouter();
  const { user, loading: userLoading, isAdmin } = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserReports();
    }
  }, [user]);

  const fetchUserReports = async () => {
    try {
      setReportsLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReportsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setReportsLoading(false);
    }
  };

  // Redirect to admin dashboard if user is admin
  useEffect(() => {
    if (isAdmin) {
      router.push('/AdminDashboard');
    }
  }, [isAdmin, router]);

  const dashboardCards = [
    {
      title: "Add Report",
      description: "Report a new issue in your area",
      icon: PlusCircle,
      action: () => router.push("/report"),
      color: "bg-gradient-to-r from-green-500 to-green-700"
    },
    {
      title: "Leaderboard",
      description: "Check community rankings",
      icon: Trophy,
      action: () => router.push("/leaderboard"),
      color: "bg-gradient-to-r from-yellow-500 to-yellow-700"
    },
    {
      title: "Official Actions",
      description: "View official responses",
      icon: BarChart3,
      action: () => router.push("/municipality"),
      color: "bg-gradient-to-r from-blue-500 to-blue-700"
    },
    {
      title: "Report Heatmaps",
      description: "Visualize area issues",
      icon: MapPin,
      action: () => router.push("/heatmaps"),
      color: "bg-gradient-to-r from-purple-500 to-purple-700"
    }
  ];

  const userStats = {
    totalReports: reports.length,
    verifiedReports: reports.filter(r => r.verification_status === 'verified').length,
    pendingReports: reports.filter(r => r.verification_status === 'pending').length,
    honorPoints: user?.honor_score_points || 0
  };

  const recentReports = reports.slice(0, 5);

  if (userLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/80">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
            <p className="text-white/80 mb-6">Please sign in to access your dashboard.</p>
            <Button onClick={() => router.push('/sign-in')} className="w-full">
              Sign In
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
          <h1 className="text-3xl font-bold hero-text">Welcome back, {user.full_name || 'User'}!</h1>
        </div>
        <Button 
          onClick={() => router.push("/profile")}
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
        >
          <User className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="glass-effect">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Make Your Community Better
                </h2>
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                  Report issues, track progress, and contribute to building a better neighborhood for everyone.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats moved to Profile page */}

        {/* Dashboard Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="glass-effect hover:bg-white/10 transition-colors cursor-pointer h-full"
                onClick={card.action}
              >
                <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                  </div>
                  <p className="text-white/80 text-sm">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Your Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span className="text-white/80">Loading reports...</span>
                </div>
              ) : reportsError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400">Error loading reports: {reportsError}</p>
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-white/80 mb-4">You haven&apos;t submitted any reports yet.</p>
                  <Button onClick={() => router.push("/report")} className="bg-gradient-primary">
                    <PlusCircle className="h-4 w-4 mr-2" />
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
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
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
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/70">
                          {report.issue_category?.type || 'Unknown'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {reports.length > 5 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => router.push("/profile")}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        View All Reports
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default UserDashboard;