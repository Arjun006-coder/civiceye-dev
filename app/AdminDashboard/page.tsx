"use client";

import React from "react";
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
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import AdminReports from "@/components/AdminReports";

const AdminDashboard = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

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
          <p className="text-white/80">Please wait while we load the admin dashboard</p>
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
          <p className="text-white/80 mb-6">You need to be signed in to access the admin dashboard</p>
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
  
  // Mock statistics data
  const stats = [
    {
      title: "Total Reports",
      value: "1,234",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Pending Verification",
      value: "89",
      change: "+5%",
      icon: AlertCircle,
      color: "text-orange-600"
    },
    {
      title: "Verified Reports",
      value: "1,089",
      change: "+8%",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Active Departments",
      value: "8",
      change: "+2%",
      icon: Users,
      color: "text-purple-600"
    }
  ];

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
      description: "Configure admin preferences",
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
        <div>
          <h1 className="text-3xl font-bold hero-text">Admin Dashboard</h1>
          <p className="text-white/90 mt-1">
            Manage reports, municipalities, and system operations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="glass-effect">
            Administrator
          </Badge>
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
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat) => (
            <Card key={stat.title} className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-vibrant-green mt-1 font-medium">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color === 'text-blue-600' ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 
                    stat.color === 'text-orange-600' ? 'bg-gradient-to-r from-orange-500 to-orange-700' :
                    stat.color === 'text-green-600' ? 'bg-gradient-to-r from-green-500 to-green-700' :
                    'bg-gradient-to-r from-purple-500 to-purple-700'}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList className="glass-effect">
              <TabsTrigger value="reports">Report Management</TabsTrigger>
              <TabsTrigger value="municipalities">Municipalities</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card className="cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all">
                          <CardContent className="p-6 text-center">
                            <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-4`}>
                              <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">
                              {action.title}
                            </h3>
                            <p className="text-sm text-white/90">
                              {action.description}
                            </p>
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
                  <CardTitle className="text-foreground">System Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Report Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-48 flex items-center justify-center text-white/80">
                            <TrendingUp className="h-12 w-12 mr-4" />
                            <span>Analytics visualization coming soon</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Geographic Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-48 flex items-center justify-center text-white/80">
                            <MapPin className="h-12 w-12 mr-4" />
                            <span>Map visualization coming soon</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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

export default AdminDashboard;