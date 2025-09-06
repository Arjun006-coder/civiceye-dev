'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";


const teamMembers = [
  {
    name: "Arjun Agrawal",
    role: "Lead Developer",
    bio: "CSE Department, KIET Group of Institutions. Passionate about coding, web development, and problem-solving. Exploring Python, C, C++, and web technologies.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    social: { 
      github: "https://github.com/Arjun006-coder", 
      linkedin: "https://www.linkedin.com/in/arjun-agrawal-ab82a5328", 
      email: "arjun1234agrawal@gmail.com" 
    }
  },
  {
    name: "Sarah Chen",
    role: "UX Designer", 
    bio: "Designs user-centered experiences that make civic participation accessible to everyone.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    social: { github: "#", linkedin: "#", email: "sarah@civic-eye.com" }
  },
  {
    name: "Michael Torres",
    role: "Community Manager",
    bio: "Bridges the gap between technology and community needs through engagement and outreach.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    social: { github: "#", linkedin: "#", email: "michael@civic-eye.com" }
  },
  {
    name: "Emily Rodriguez",
    role: "Data Analyst",
    bio: "Transforms civic data into actionable insights that drive community improvements.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    social: { github: "#", linkedin: "#", email: "emily@civic-eye.com" }
  },
  {
    name: "David Kim",
    role: "Backend Developer",
    bio: "Specializes in scalable server architecture and database optimization for civic platforms.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    social: { github: "#", linkedin: "#", email: "david@civic-eye.com" }
  },
  {
    name: "Lisa Wang",
    role: "Frontend Developer",
    bio: "Creates responsive and accessible user interfaces that work seamlessly across all devices.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    social: { github: "#", linkedin: "#", email: "lisa@civic-eye.com" }
  }
];

const Team = () => {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
      </div>

      <div className="relative z-10 px-4 py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-8"
        >
          <Link href="/">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-6xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold hero-text mb-6">
            Meet Our Team
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Passionate individuals working together to strengthen communities through technology
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="civic-card text-center h-full">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex justify-center space-x-3">
                    <a
                      href={member.social.github}
                      className="p-2 bg-muted hover:bg-primary rounded-lg transition-all duration-300 group"
                    >
                      <Github size={16} className="text-muted-foreground group-hover:text-primary-foreground" />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="p-2 bg-muted hover:bg-primary rounded-lg transition-all duration-300 group"
                    >
                      <Linkedin size={16} className="text-muted-foreground group-hover:text-primary-foreground" />
                    </a>
                    <a
                      href={`mailto:${member.social.email}`}
                      className="p-2 bg-muted hover:bg-primary rounded-lg transition-all duration-300 group"
                    >
                      <Mail size={16} className="text-muted-foreground group-hover:text-primary-foreground" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Team;