'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";

const Leaderboard = () => {
  const router = useRouter();

  const leaderboardData = [
    { rank: 1, name: "Sarah Chen", points: 1250, reports: 25, resolved: 23, badge: "Community Champion" },
    { rank: 2, name: "Michael Rodriguez", points: 1100, reports: 22, resolved: 20, badge: "Civic Hero" },
    { rank: 3, name: "Emma Johnson", points: 950, reports: 19, resolved: 17, badge: "Problem Solver" },
    { rank: 4, name: "David Kim", points: 875, reports: 18, resolved: 15, badge: "Active Citizen" },
    { rank: 5, name: "Lisa Thompson", points: 800, reports: 16, resolved: 14, badge: "Community Helper" },
    { rank: 6, name: "James Wilson", points: 750, reports: 15, resolved: 13, badge: "Issue Reporter" },
    { rank: 7, name: "Maria Garcia", points: 700, reports: 14, resolved: 12, badge: "Civic Contributor" },
    { rank: 8, name: "Alex Parker", points: 650, reports: 13, resolved: 11, badge: "Community Member" },
    { rank: 9, name: "Jennifer Lee", points: 600, reports: 12, resolved: 10, badge: "Active Reporter" },
    { rank: 10, name: "Robert Brown", points: 550, reports: 11, resolved: 9, badge: "Helper" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-primary text-primary-foreground";
    if (rank <= 5) return "bg-secondary/20 text-secondary border-secondary/30";
    return "bg-muted/20 text-muted-foreground border-muted/30";
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center p-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="glass-effect hover:bg-primary/20 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold hero-text">Community Leaderboard</h1>
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
          <h2 className="text-4xl font-bold mb-4 hero-text">
            Top Contributors
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Celebrating our most active community members who are making a difference
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {leaderboardData.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.rank}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.2, duration: 0.6 }}
              className={`${index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'}`}
            >
              <Card className={`glass-effect text-center ${index === 0 ? 'md:scale-110' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(user.rank)}
                  </div>
                  <CardTitle className="text-2xl text-foreground">{user.name}</CardTitle>
                  <Badge className={getRankBadgeColor(user.rank)}>
                    #{user.rank}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-primary">{user.points}</p>
                    <p className="text-sm text-muted-foreground">Honor Points</p>
                    <div className="pt-2 border-t border-border/50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-semibold text-foreground">{user.reports}</p>
                          <p className="text-muted-foreground">Reports</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.resolved}</p>
                          <p className="text-muted-foreground">Resolved</p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {user.badge}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Rest of Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Full Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.slice(3).map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/20">
                        <span className="font-bold text-foreground">#{user.rank}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{user.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {user.badge}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">{user.points}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.reports} reports • {user.resolved} resolved
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User's Position */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8"
        >
          <Card className="glass-effect border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                    <span className="font-bold text-primary">#23</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Your Position</h3>
                    <p className="text-muted-foreground">Keep reporting to climb higher!</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-xl">450</p>
                  <p className="text-sm text-muted-foreground">Honor Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;