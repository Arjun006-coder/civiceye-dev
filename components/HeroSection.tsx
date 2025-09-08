'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CivicCard } from "./CivicCard";
import { useRouter } from "next/navigation";

const civicFeatures = [
  {
    title: "Report Issues",
    description: "Submit and track community problems with ease",
    icon: "ClipboardCheck",
  },
  {
    title: "Track Progress",
    description: "Monitor the status of reported issues in real-time",
    icon: "TrendingUp",
  },
  {
    title: "Community Forums",
    description: "Engage with neighbors and local government",
    icon: "MessageSquare",
  },
  {
    title: "City Services",
    description: "Access municipal services and information",
    icon: "Building",
  },
];

export const HeroSection = () => {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden gradient-bg">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-bold hero-text mb-6">
            Civic-Eye
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl md:text-2xl text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] max-w-2xl mx-auto"
          >
            Empowering communities through transparent civic engagement
          </motion.p>
        </motion.div>

        {/* Civic Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
          {civicFeatures.map((feature, index) => (
            <CivicCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>

        {/* Get Started Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-8 py-4 text-lg rounded-xl shadow-glow animate-glow"
            onClick={() => {
              // Navigate to sign-in page
              router.push('/sign-in');
            }}
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </section>
  );
};