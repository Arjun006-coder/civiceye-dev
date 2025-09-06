'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, CheckCircle, Clock, Calendar, FileText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";

const Municipality = () => {
  const router = useRouter();

  const municipalityActions = [
    {
      id: 1,
      title: "Street Light Repair Initiative",
      description: "Comprehensive repair and upgrade of street lighting across downtown area",
      status: "completed",
      date: "2025-08-15",
      department: "Public Works",
      budget: "$45,000",
      reportsAddressed: 15,
      timeline: "2 weeks"
    },
    {
      id: 2,
      title: "Road Pothole Repair Program",
      description: "Systematic pothole repair across major residential streets",
      status: "in-progress",
      date: "2025-08-28",
      department: "Transportation",
      budget: "$120,000",
      reportsAddressed: 28,
      timeline: "4 weeks"
    },
    {
      id: 3,
      title: "Park Safety Enhancement",
      description: "Installation of additional security lighting and emergency call boxes",
      status: "planned",
      date: "2025-09-10",
      department: "Parks & Recreation",
      budget: "$75,000",
      reportsAddressed: 8,
      timeline: "3 weeks"
    },
    {
      id: 4,
      title: "Waste Collection Route Optimization",
      description: "Reorganization of waste collection schedules to improve efficiency",
      status: "completed",
      date: "2025-08-01",
      department: "Sanitation",
      budget: "$25,000",
      reportsAddressed: 22,
      timeline: "1 week"
    },
    {
      id: 5,
      title: "Traffic Signal Modernization",
      description: "Upgrade of traffic control systems with smart technology",
      status: "in-progress",
      date: "2025-09-01",
      department: "Traffic Management",
      budget: "$200,000",
      reportsAddressed: 12,
      timeline: "6 weeks"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-warning" />;
      case "planned":
        return <Calendar className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/20 text-success border-success/30";
      case "in-progress":
        return "bg-warning/20 text-warning border-warning/30";
      case "planned":
        return "bg-info/20 text-info border-info/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const totalBudget = municipalityActions.reduce((sum, action) => {
    return sum + parseInt(action.budget.replace(/[$,]/g, ''));
  }, 0);

  const completedActions = municipalityActions.filter(action => action.status === 'completed').length;
  const totalReportsAddressed = municipalityActions.reduce((sum, action) => sum + action.reportsAddressed, 0);

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
        <h1 className="text-3xl font-bold hero-text">Municipality Actions</h1>
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
            Official Government Response
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track how your local government is addressing community-reported issues
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Building2 className="h-5 w-5 mr-2 text-primary" />
                Total Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{municipalityActions.length}</p>
              <p className="text-sm text-muted-foreground">Government initiatives</p>
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
              <p className="text-3xl font-bold text-success">{completedActions}</p>
              <p className="text-sm text-muted-foreground">Finished projects</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Users className="h-5 w-5 mr-2 text-secondary" />
                Reports Addressed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{totalReportsAddressed}</p>
              <p className="text-sm text-muted-foreground">Community issues</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <FileText className="h-5 w-5 mr-2 text-accent" />
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">${(totalBudget / 1000).toFixed(0)}K</p>
              <p className="text-sm text-muted-foreground">Allocated funds</p>
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
              <CardTitle className="text-xl text-foreground">Recent Municipality Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {municipalityActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className="p-6 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(action.status)}
                          <h3 className="text-xl font-semibold text-foreground">{action.title}</h3>
                          <Badge className={getStatusColor(action.status)}>
                            {action.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Department</p>
                          <p className="text-muted-foreground">{action.department}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-secondary" />
                        <div>
                          <p className="font-medium text-foreground">Start Date</p>
                          <p className="text-muted-foreground">{new Date(action.date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-accent" />
                        <div>
                          <p className="font-medium text-foreground">Budget</p>
                          <p className="text-muted-foreground">{action.budget}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-warning" />
                        <div>
                          <p className="font-medium text-foreground">Reports</p>
                          <p className="text-muted-foreground">{action.reportsAddressed} addressed</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Timeline: {action.timeline}
                        </span>
                        {action.status === 'completed' && (
                          <span className="text-sm text-success font-medium">
                            ✓ Project completed successfully
                          </span>
                        )}
                        {action.status === 'in-progress' && (
                          <span className="text-sm text-warning font-medium">
                            🔄 Currently in progress
                          </span>
                        )}
                        {action.status === 'planned' && (
                          <span className="text-sm text-info font-medium">
                            📅 Scheduled to begin
                          </span>
                        )}
                      </div>
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

export default Municipality;