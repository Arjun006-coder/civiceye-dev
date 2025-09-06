'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Trophy, 
  FileText, 
  Edit3, 
  Award,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";

const Profile = () => {
  const router = useRouter();

  const userStats = {
    honorPoints: 450,
    totalReports: 12,
    resolvedReports: 8,
    pendingReports: 3,
    rejectedReports: 1,
    communityRank: 23,
    joinDate: "March 2024"
  };

  const recentReports = [
    {
      id: 1,
      title: "Broken Street Light on Main St",
      status: "resolved",
      date: "2025-09-01",
      points: 50,
      location: "Main Street, Downtown"
    },
    {
      id: 2,
      title: "Pothole on Park Avenue",
      status: "pending",
      date: "2025-08-28",
      points: 0,
      location: "Park Avenue, Block 5"
    },
    {
      id: 3,
      title: "Garbage Collection Issue",
      status: "resolved",
      date: "2025-08-25",
      points: 75,
      location: "Residential Area, Zone 3"
    },
    {
      id: 4,
      title: "Water Leakage in Public Park",
      status: "pending",
      date: "2025-08-20",
      points: 0,
      location: "Central Park"
    },
    {
      id: 5,
      title: "Traffic Signal Malfunction",
      status: "resolved",
      date: "2025-08-15",
      points: 100,
      location: "Market Square Intersection"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-success/20 text-success border-success/30";
      case "pending":
        return "bg-warning/20 text-warning border-warning/30";
      case "rejected":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
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
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="glass-effect hover:bg-primary/20 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold hero-text">My Profile</h1>
        </div>
        <Button
          onClick={() => router.push("/edit-profile")}
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
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
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">JD</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">John Doe</h2>
                  <p className="text-muted-foreground">john.doe@email.com</p>
                  <div className="flex items-center mt-2">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Trophy className="h-5 w-5 mr-2 text-primary" />
                Honor Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{userStats.honorPoints}</p>
              <p className="text-sm text-muted-foreground">Rank #{userStats.communityRank}</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <FileText className="h-5 w-5 mr-2 text-secondary" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{userStats.totalReports}</p>
              <p className="text-sm text-muted-foreground">All time submissions</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <CheckCircle className="h-5 w-5 mr-2 text-success" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">{userStats.resolvedReports}</p>
              <p className="text-sm text-muted-foreground">
                {Math.round((userStats.resolvedReports / userStats.totalReports) * 100)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Award className="h-5 w-5 mr-2 text-accent" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">5</p>
              <p className="text-sm text-muted-foreground">Badges earned</p>
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
                        {getStatusIcon(report.status)}
                        <h3 className="font-semibold text-foreground">{report.title}</h3>
                        <Badge className={`${getStatusColor(report.status)}`}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {report.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(report.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {report.points > 0 ? `+${report.points}` : "0"} pts
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;