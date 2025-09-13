"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
  Trophy
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminReports from "@/components/AdminReports";
import { Footer } from "@/components/Footer";

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
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      
      const data = await response.json();
      setStats(data.stats);
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
      <header className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl sm:text-3xl font-bold hero-text">Admin Dashboard</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <p className="text-white/90 font-medium text-sm sm:text-base">{user.fullName || user.emailAddresses[0]?.emailAddress}</p>
            <p className="text-white/70 text-xs sm:text-sm">Administrator</p>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="glass-effect hover:bg-red-500/20 border-red-400/50 text-red-400 hover:text-red-300 w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
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
              <CardTitle className="flex items-center text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
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
              <CardTitle className="flex items-center text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
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
              <CardTitle className="flex items-center text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
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
            <TabsList className="grid w-full grid-cols-4 glass-effect">
              <TabsTrigger value="reports" className="text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="municipalities" className="text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                System Management
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="problems" className="text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">
                <TrendingUp className="h-4 w-4 mr-2" />
                Problems
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
                  <div className="space-y-6">
                    {/* Leaderboard Management */}
                    <div className="p-4 border border-primary/30 rounded-lg bg-primary/10">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Leaderboard Management</h3>
                      <p className="text-sm text-white/80 mb-4">
                        Populate or refresh the leaderboard with current user data.
                      </p>
                      <Button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/leaderboard/populate', { method: 'POST' });
                            if (response.ok) {
                              alert('Leaderboard populated successfully!');
                            } else {
                              alert('Failed to populate leaderboard');
                            }
                          } catch (error) {
                            alert('Error populating leaderboard');
                          }
                        }}
                        className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Populate Leaderboard
                      </Button>
                    </div>

                    {/* Quick Actions */}
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

            <TabsContent value="problems">
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/problems', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'backfill' }) });
                      if (!res.ok) throw new Error('Backfill failed');
                      alert('Backfill completed');
                    } catch {
                      alert('Failed to backfill problems');
                    }
                  }}
                >
                  Backfill from verified reports
                </Button>
              </div>
              <ProblemList />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminDashboardWrapper;

// Render the modal near root to avoid stacking issues
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _AttachModalAtRoot = (() => {
  // no-op placeholder to keep helpers nearby
  return null;
})();

// Problems tab component
type MinimalProblem = {
  id: string;
  status: string;
  reports_count: number;
  centroid_lat: number | string;
  centroid_lng: number | string;
  radius_m: number;
};

function ProblemList() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [problems, setProblems] = React.useState<MinimalProblem[]>([]);
  const [selected, setSelected] = React.useState<MinimalProblem | null>(null);
  const [details, setDetails] = React.useState<{ reports: any[] } | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [claiming, setClaiming] = React.useState<string | null>(null);
  const [areaFilter, setAreaFilter] = React.useState('');

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/problems');
      if (!res.ok) throw new Error('Failed to load problems');
      const data = await res.json();
      setProblems(data.problems || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProblems();
  }, []);

  const claimResolved = async (problemId: string) => {
    try {
      setClaiming(problemId);
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim_resolved', problem_id: problemId })
      });
      if (!res.ok) throw new Error('Failed to claim resolved');
      await fetchProblems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setClaiming(null);
    }
  };

  const openDetails = async (problem: MinimalProblem) => {
    try {
      setSelected(problem);
      const res = await fetch(`/api/problems/${problem.id}`);
      if (!res.ok) throw new Error('Failed to load details');
      const data = await res.json();
      setDetails({ reports: data.reports || [] });
      setDetailsOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-8 text-center">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="text-foreground">Problems (Grouped issues)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <input
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            placeholder="Filter by place/address keyword"
            className="w-full md:w-80 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/60"
          />
        </div>
        {problems.length === 0 ? (
          <div className="text-center py-8 text-white/80">No problems yet.</div>
        ) : (
          <div className="space-y-4">
            {problems.map((p) => (
              <div key={p.id} className="p-4 rounded-lg border border-border/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${
                      p.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                      p.status === 'disputed' ? 'bg-red-100 text-red-800 border-red-200' :
                      p.status === 'public_verification' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-white/10 border-white/20'
                    }`}>{p.status}</Badge>
                    <span className="text-foreground font-semibold">{p.reports_count} reports</span>
                  </div>
                  <ProblemPreview problemId={p.id} centroid={{ lat: Number(p.centroid_lat), lng: Number(p.centroid_lng) }} areaFilter={areaFilter} />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => openDetails(p)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={claiming === p.id || p.status === 'public_verification'}
                    onClick={() => claimResolved(p.id)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {claiming === p.id ? 'Claiming…' : 'Claim Resolved'}
                  </Button>
                  {p.status !== 'open' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/problems', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reopen', problem_id: p.id }) })
                          if (!res.ok) throw new Error('Failed to reopen')
                          await fetchProblems()
                        } catch {}
                      }}
                    >
                      Unmark / Reopen
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    {/* Details modal */}
    <ProblemDetails open={detailsOpen} onClose={() => setDetailsOpen(false)} problem={selected} details={details} />
    </>
  );
}

// Simple details modal
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative max-w-4xl w-full glass-effect rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-foreground text-lg font-semibold">{title}</h3>
          <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={onClose}>Close</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Attach details modal rendering
function ProblemDetails({ open, onClose, problem, details }: { open: boolean; onClose: () => void; problem: MinimalProblem | null; details: { reports: any[] } | null }) {
  return (
    <Modal open={open} onClose={onClose} title={problem ? `Problem (${problem.reports_count} reports)` : 'Problem'}>
      {!details || !details.reports || details.reports.length === 0 ? (
        <div className="text-white/80">No reports found for this problem.</div>
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-auto">
          {details.reports.map((r) => (
            <div key={r.id} className="p-3 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-foreground font-semibold">{r.title}</div>
                <div className="text-xs text-white/70">{r.issue_category?.type || 'Unknown'}</div>
              </div>
              <div className="text-sm text-white/80 mt-1">{r.user?.full_name} · {r.user?.email}</div>
              <div className="text-sm text-white/70 mt-1">{r.address}</div>
              {Array.isArray(r.images) && r.images.length > 0 && (
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {r.images.map((img: string, i: number) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img} alt="evidence" className="w-full h-24 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// Inline preview component to show title/address/issue type from the first report
function ProblemPreview({ problemId, centroid, areaFilter }: { problemId: string; centroid: { lat: number; lng: number }; areaFilter: string }) {
  const [meta, setMeta] = React.useState<{ title?: string; address?: string; issue?: string } | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch(`/api/problems/${problemId}`)
        if (!res.ok) return
        const data = await res.json()
        const first = Array.isArray(data.reports) && data.reports.length > 0 ? data.reports[0] : null
        if (!cancelled) setMeta(first ? { title: first.title, address: first.address, issue: first.issue_category?.type } : {})
      } catch {}
    }
    run()
    return () => { cancelled = true }
  }, [problemId])

  const addressMatches = areaFilter.trim().length === 0 || (meta?.address || '').toLowerCase().includes(areaFilter.trim().toLowerCase())
  if (!addressMatches) return null

  return (
    <div className="text-sm text-white/70 mt-1">
      Lat {centroid.lat.toFixed(5)}, Lng {centroid.lng.toFixed(5)} · Radius 35m
      {meta?.issue && <div className="mt-1">Issue: <span className="text-white/90">{meta.issue}</span></div>}
      {meta?.title && <div className="mt-0.5">Title: <span className="text-white/90">{meta.title}</span></div>}
      {meta?.address && <div className="mt-0.5">Address: <span className="text-white/90">{meta.address}</span></div>}
    </div>
  )
}