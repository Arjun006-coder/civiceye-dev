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
  Loader2,
  AlertTriangle,
  FileText,
  CheckCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Report } from "@/lib/supabase";
import { Footer } from "@/components/Footer";
import { Bell } from "lucide-react";

const UserDashboard = () => {
  const router = useRouter();
  const { user, loading: userLoading, isAdmin } = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  type UINotification = {
    id: string;
    is_read: boolean;
    title: string;
    message: string;
    related_problem_id?: string;
  };
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserReports();
    }
  }, [user]);

  // Refresh reports when notifications change (in case status was updated)
  useEffect(() => {
    if (notifications.length > 0) {
      fetchUserReports();
    }
  }, [notifications]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch {}
    };
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (notifOpen) {
      (async () => {
        try {
          const res = await fetch('/api/notifications');
          if (!res.ok) return;
          const data = await res.json();
          setNotifications(data.notifications || []);
        } catch {}
      })();
    }
  }, [notifOpen]);

  const fetchUserReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.reports || []);
      console.log('Reports fetched:', data.reports?.map(r => ({ id: r.id, status: r.verification_status, title: r.title })));
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  // Redirect to admin dashboard if user is admin
  useEffect(() => {
    if (isAdmin) {
      router.replace('/AdminDashboard');
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
    resolvedReports: reports.filter(r => r.verification_status === 'resolved').length,
    honorPoints: user?.honor_score_points || 0
  };


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
      <header className="relative z-50 flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold hero-text">Welcome back, {user.full_name || 'User'}!</h1>
          <Button
            onClick={fetchUserReports}
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Refresh
          </Button>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-white" />
            {notifications.some(n => !n.is_read) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>
          <Button 
            onClick={() => router.push("/profile")}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
          >
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          {notifOpen && (
            <div className="fixed right-6 top-16 w-80 max-h-96 overflow-auto glass-effect rounded-xl p-2" style={{ zIndex: 99999 }}>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm text-white/80">Notifications</span>
                <button
                  className="text-xs text-white/60 hover:text-white"
                  onClick={async () => {
                    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mark: 'read_all' }) });
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                  }}
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-white/10">
                {notifications.length === 0 && (
                  <div className="p-4 text-sm text-white/70">No notifications</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-white">{n.title}</div>
                        <div className="text-white/80 mt-0.5">{n.message}</div>
                        {n.related_problem_id && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                              onClick={async () => {
                                const res = await fetch('/api/problems/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem_id: n.related_problem_id, vote: 'agree' }) });
                                const data = await res.json();
                                await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mark: 'read_one', id: n.id }) });
                                setNotifications(prev => prev.filter(x => x.id !== n.id));
                                alert(data.status ? `Thanks! Current status: ${data.status}` : 'Vote recorded.');
                              }}
                            >
                              I agree
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                              onClick={async () => {
                                const res = await fetch('/api/problems/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem_id: n.related_problem_id, vote: 'disagree' }) });
                                const data = await res.json();
                                await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mark: 'read_one', id: n.id }) });
                                setNotifications(prev => prev.filter(x => x.id !== n.id));
                                alert(data.status ? `Thanks! Current status: ${data.status}` : 'Vote recorded.');
                              }}
                            >
                              Not resolved
                            </Button>
                          </div>
                        )}
                      </div>
                      {!n.is_read && <span className="mt-1 w-2 h-2 bg-blue-400 rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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

        {/* Activity Summary Cards removed per UX feedback */}

        {/* View Profile Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <Card className="glass-effect">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Want to see more details?</h3>
              <p className="text-white/80 mb-6">View your complete profile, report history, and achievements.</p>
              <Button 
                onClick={() => router.push("/profile")}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-3"
              >
                <User className="h-5 w-5 mr-2" />
                View Full Profile & Reports
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserDashboard;