'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Github, Linkedin, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const teamMembers = [
  {
    name: "Arjun Agrawal",
    role: "Lead Developer",
    bio: "CSE Department, KIET Group of Institutions. Passionate about coding, web development, and problem-solving. Exploring Python, C, C++, and web technologies.",
    image: "/WhatsApp%20Image%202025-09-08%20at%2011.13.16.jpeg",
    social: { 
      github: "https://github.com/Arjun006-coder", 
      linkedin: "https://www.linkedin.com/in/arjun-agrawal-ab82a5328", 
      email: "arjun1234agrawal@gmail.com" 
    }
  },
  {
    name: "Aditi Vashishtha",
    role: "Presentation Designer & UI/UX Specialist",
    bio: "ECE Department, KIET Group of Institutions. Specializes in creating compelling presentations and user interface designs. Expert in visual communication and user experience optimization.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    social: { 
      github: "https://github.com/Aditivashistha", 
      linkedin: "https://www.linkedin.com/in/aditi-vashishth-5b9775375?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", 
      email: "aditi.vashishtha@kiet.edu" 
    }
  },
  {
    name: "Suraj Verma",
    role: "Community Manager",
    bio: "IT Department, KIET Group of Institutions. Facilitates collaboration, organizes outreach, and keeps communication flowing between teams and the community.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    social: { github: "#", linkedin: "#", email: "suraj.verma@kiet.edu" }
  },
  {
    name: "Aditya Kumar",
    role: "Frontend Developer",
    bio: "EEE Department, KIET Group of Institutions. Focused on systems, energy basics, and getting things done — this is just formality, no one knows anything but we ship.",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&h=400&fit=crop&crop=face",
    social: { github: "#", linkedin: "#", email: "aditya.kumar@kiet.edu" }
  },
  {
    name: "Priyanshu Tomar",
    role: "Backend Developer",
    bio: "CSE Department, KIET Group of Institutions. Builds reliable APIs, optimizes databases, and keeps the server-side clean and scalable.",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face",
    social: { github: "#", linkedin: "#", email: "priyanshu.tomar@kiet.edu" }
  },
  {
    name: "Achal",
    role: "Data Analyst",
    bio: "EEE Department, KIET Group of Institutions. Turns raw data into simple dashboards and insights everyone can use.",
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face",
    social: { github: "#", linkedin: "#", email: "achal@kiet.edu" }
  }
];

const Team = () => {
  const router = useRouter();

  const handleGoBack = () => {
    // Check if we came from within the app (not external)
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    if (referrer && referrer.startsWith(currentOrigin)) {
      // We came from within the app, go back
      router.back();
    } else {
      // No referrer or external referrer, go to home
      router.push('/');
    }
  };
  
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
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-white hover:text-gray-200 hover:bg-white/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </Button>
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
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
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
                    <p className="text-vibrant-cyan font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-sm text-white/80 mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex justify-center space-x-3">
                    <a
                      href={member.social.github}
                      className="p-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 rounded-lg transition-all duration-300 group"
                    >
                      <Github size={16} className="text-white group-hover:text-gray-100" />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="p-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg transition-all duration-300 group"
                    >
                      <Linkedin size={16} className="text-white group-hover:text-blue-100" />
                    </a>
                    <a
                      href={`mailto:${member.social.email}`}
                      className="p-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 rounded-lg transition-all duration-300 group"
                    >
                      <Mail size={16} className="text-white group-hover:text-red-100" />
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
