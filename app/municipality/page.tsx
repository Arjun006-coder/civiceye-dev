'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, CheckCircle, Clock, Calendar, FileText, Users, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MunicipalityAction } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui/status-badge";

const Municipality = () => {
  const router = useRouter();
  const [actions, setActions] = useState<MunicipalityAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/actions');
      if (!response.ok) throw new Error('Failed to fetch actions');
      
      const data = await response.json();
      setActions(data.actions || []);
    } catch (err) {
      console.error('Error fetching actions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-400 to-green-600 text-green-900";
      case "in_progress":
        return "bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900";
      case "planning":
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900";
      case "on_hold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900";
      case "rejected":
        return "bg-gradient-to-r from-red-400 to-red-600 text-red-900";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-gray-900";
    }
  };

  const totalBudget = actions.reduce((sum, action) => {
    return sum + (action.cost_estimate || 0);
  }, 0);

  const completedActions = actions.filter(action => action.action_type === 'completed').length;
  const totalReportsAddressed = actions.reduce((sum, action) => sum + 1, 0); // Each action addresses one report

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
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            className="glass-effect hover:bg-primary/20 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold hero-text">Official Actions</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Government Response Actions
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Track official responses and actions taken by government departments to address community issues.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Building2 className="h-5 w-5 mr-2 text-primary" />
                Total Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <>
                  <p className="text-3xl font-bold text-vibrant-blue">{actions.length}</p>
                  <p className="text-sm text-white/90 font-medium">Official initiatives</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <CheckCircle className="h-5 w-5 mr-2 text-success" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <>
                  <p className="text-3xl font-bold text-vibrant-green">{completedActions}</p>
                  <p className="text-sm text-white/90 font-medium">Successfully completed</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <FileText className="h-5 w-5 mr-2 text-secondary" />
                Reports Addressed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <>
                  <p className="text-3xl font-bold text-vibrant-purple">{totalReportsAddressed}</p>
                  <p className="text-sm text-white/90 font-medium">Issues being addressed</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Calendar className="h-5 w-5 mr-2 text-accent" />
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <>
                  <p className="text-3xl font-bold text-vibrant-yellow">
                    ₹{totalBudget.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/90 font-medium">Allocated budget</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Recent Official Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                  <span className="text-white/80">Loading actions...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 mb-4">Error loading actions: {error}</p>
                  <Button onClick={fetchActions} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : actions.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-white/80">No official actions available yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {actions.map((action, index) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                      className="p-6 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {action.action_description}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-white/70 mb-3">
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {action.assigned_department}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {action.created_at ? new Date(action.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                            {action.cost_estimate && (
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                ₹{action.cost_estimate.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <StatusBadge 
                          status={action.action_type} 
                          type="action" 
                        />
                      </div>

                      {action.report && (
                        <div className="bg-card/50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-foreground mb-2">Related Report</h4>
                          <p className="text-sm text-white/80 mb-2">{action.report.title}</p>
                          <div className="flex items-center space-x-4 text-xs text-white/60">
                            <span>{action.report.address}</span>
                            <span>{action.report.issue_category?.type || 'Unknown'}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-white/70 border-white/30">
                            Priority: {action.priority_level}
                          </Badge>
                          {action.estimated_completion && (
                            <span className="text-sm text-white/70">
                              Est. Completion: {new Date(action.estimated_completion).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-white/50" />
                          <span className="text-sm text-white/70">
                            {action.start_date ? new Date(action.start_date).toLocaleDateString() : 'Not started'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Municipality;