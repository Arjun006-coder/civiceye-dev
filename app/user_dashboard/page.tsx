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
  FileText 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";

const Dashboard = () => {
  const router = useRouter();

  const dashboardCards = [
    {
      title: "Add Report",
      description: "Report civic issues in your area",
      icon: PlusCircle,
      action: () => router.push("/report"),
      color: "bg-gradient-primary"
    },
    {
      title: "Leaderboard",
      description: "Check community rankings",
      icon: Trophy,
      action: () => router.push("/leaderboard"),
      color: "bg-gradient-to-r from-secondary to-accent"
    },
    {
      title: "Municipality Actions",
      description: "View official responses",
      icon: BarChart3,
      action: () => router.push("/municipality"),
      color: "bg-gradient-to-r from-accent to-primary"
    },
    {
      title: "Report Heatmaps",
      description: "Visualize area issues",
      icon: MapPin,
      action: () => router.push("/heatmaps"),
      color: "bg-gradient-to-r from-primary to-secondary"
    }
  ];

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>
      <div className="floating-blob"></div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold hero-text">Civic-Eye Dashboard</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/profile")}
          className="glass-effect hover:bg-primary/20"
        >
          <User className="h-5 w-5 mr-2" />
          Profile
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold mb-4 hero-text">
            Welcome Back!
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Make your community better by reporting issues and tracking progress
          </p>
        </motion.div>

        {/* Dashboard Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
            >
              <Card 
                className="civic-card cursor-pointer h-48 group"
                onClick={card.action}
              >
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                My Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">12</p>
              <p className="text-muted-foreground">Total submitted</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Trophy className="h-5 w-5 mr-2 text-secondary" />
                Honor Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">450</p>
              <p className="text-muted-foreground">Community rank: #23</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <BarChart3 className="h-5 w-5 mr-2 text-accent" />
                Resolved Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">8</p>
              <p className="text-muted-foreground">67% resolution rate</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;