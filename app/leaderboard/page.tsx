'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award, Crown, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LeaderboardEntry } from "@/lib/supabase";

const Leaderboard = () => {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <Trophy className="h-5 w-5 text-muted-foreground" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900";
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600 text-amber-900";
    if (rank <= 10) return "bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900";
    return "bg-gradient-to-r from-purple-400 to-purple-600 text-purple-900";
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
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            className="glass-effect hover:bg-primary/20 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold hero-text">Community Leaderboard</h1>
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
            Top Community Contributors
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            See who&apos;s making the biggest impact in your community through civic engagement and issue reporting.
          </p>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-xl text-foreground text-center">
                Community Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                  <span className="text-white/80">Loading leaderboard...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 mb-4">Error loading leaderboard: {error}</p>
                  <Button onClick={fetchLeaderboard} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-white/80">No leaderboard data available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                      className={`flex items-center justify-between p-6 rounded-lg border transition-colors ${
                        entry.rank_position <= 3 
                          ? 'border-yellow-400/50 bg-yellow-400/10' 
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(entry.rank_position)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {entry.user?.full_name || 'Anonymous User'}
                          </h3>
                          <p className="text-sm text-white/70">
                            {entry.user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-vibrant-blue">
                            {entry.total_points}
                          </p>
                          <p className="text-sm text-white/70">Points</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xl font-bold text-vibrant-green">
                            {entry.verified_reports}
                          </p>
                          <p className="text-sm text-white/70">Verified</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xl font-bold text-vibrant-orange">
                            {entry.reports_submitted}
                          </p>
                          <p className="text-sm text-white/70">Total</p>
                        </div>
                        
                        <Badge className={`px-3 py-1 text-sm font-bold ${getRankBadgeColor(entry.rank_position)}`}>
                          #{entry.rank_position}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="glass-effect">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-vibrant-yellow">
                  {leaderboard.length}
                </p>
                <p className="text-white/90 font-medium">Active Contributors</p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-vibrant-green">
                  {leaderboard.reduce((sum, entry) => sum + entry.verified_reports, 0)}
                </p>
                <p className="text-white/90 font-medium">Total Verified Reports</p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6 text-center">
                <Medal className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-vibrant-blue">
                  {leaderboard.reduce((sum, entry) => sum + entry.total_points, 0)}
                </p>
                <p className="text-white/90 font-medium">Total Points Earned</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;