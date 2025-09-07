"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Phone,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import AdminReports from "@/components/AdminReports";

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  rejectedReports: number;
  totalUsers: number;
  activeUsers: number;
  avgConfidence: number;
}

// Wrapper component to handle Clerk availability
const AdminDashboardWrapper = () => {
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
          <h1 className="text-3xl font-bold hero-text mb-8">Admin Dashboard</h1>
          <p className="text-white/80">Loading...</p>
        </main>
      </div>
    );
  }

  return <AdminDashboardContent />;
};

const AdminDashboardContent = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboardStats();
    }
  }, [isLoaded, user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard-mock');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut(() => router.push('/'));
  };

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
            <p className="text-white/80 mb-6">Please sign in to access the admin dashboard.</p>
            <Button onClick={() => router.push('/sign-in')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is admin (this will be handled by the API, but we can show a message here)
  if (user && !user.publicMetadata?.role && user.emailAddresses[0]?.emailAddress !== 'arjun1234agrawal@gmail.com') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
            <p className="text-white/80 mb-6">You don&apos;t have admin privileges to access this dashboard.</p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to User Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Contact Authorities",
      description: "Reach out to local authorities",
      icon: Phone,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Resource Planning",
      description: "View system resources",
      icon: Calendar,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Analytics Dashboard",
      description: "Detailed reports and insights",
      icon: BarChart3,
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "System Settings",
      description: "Configure system parameters",
      icon: Settings,
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ];

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold hero-text">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white/90 font-medium">{user.fullName || user.emailAddresses[0]?.emailAddress}</p>
            <p className="text-white/70 text-sm">Administrator</p>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="glass-effect hover:bg-red-500/20 border-red-400/50 text-red-400 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <>
                  <p className="text-3xl font-bold text-vibrant-blue">{stats?.totalReports || 0}</p>
                  <p className="text-sm text-white/90 font-medium">All time submissions</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <AlertCircle className="h-5 w-5 mr-2 text-warning" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <>
                  <p className="text-3xl font-bold text-vibrant-orange">{stats?.pendingReports || 0}</p>
                  <p className="text-sm text-white/90 font-medium">Awaiting review</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <CheckCircle className="h-5 w-5 mr-2 text-success" />
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <>
                  <p className="text-3xl font-bold text-vibrant-green">{stats?.verifiedReports || 0}</p>
                  <p className="text-sm text-white/90 font-medium">Successfully verified</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Users className="h-5 w-5 mr-2 text-accent" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <>
                  <p className="text-3xl font-bold text-vibrant-purple">{stats?.activeUsers || 0}</p>
                  <p className="text-sm text-white/90 font-medium">Registered users</p>
                </>
              )}
              </CardContent>
            </Card>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 glass-effect">
              <TabsTrigger value="reports" className="data-[state=active]:bg-primary/20">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="municipalities" className="data-[state=active]:bg-primary/20">
                <MapPin className="h-4 w-4 mr-2" />
                System Management
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reports">
              <AdminReports />
            </TabsContent>

            <TabsContent value="municipalities">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-foreground">System Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                      <motion.div
                        key={action.title}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card className="glass-effect hover:bg-white/10 transition-colors cursor-pointer">
                          <CardContent className="p-6 text-center">
                            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                              <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                            <p className="text-sm text-white/80">{action.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-foreground">Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Analytics Coming Soon</h3>
                    <p className="text-white/80">Advanced analytics and reporting features will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboardWrapper;