'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignUp } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link href="/">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="civic-card border-border/50 p-6"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl hero-text mb-2">Join Civic-Eye</h1>
            <p className="text-muted-foreground">
              Create your account and start making a difference
            </p>
          </div>
          
          <SignUp 
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            afterSignUpUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-glow animate-glow',
                card: 'bg-transparent shadow-none border-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-border/50 hover:bg-muted/50',
                formFieldInput: 'border-border/50 focus:border-primary',
                footerActionLink: 'text-primary hover:text-primary/80',
                rootBox: 'flex flex-col space-y-4',
                // Hide phone number field
                formFieldPhoneNumber: 'hidden',
                formFieldPhoneNumberInput: 'hidden',
                formFieldPhoneNumberLabel: 'hidden',
                // Hide alternative sign-in methods
                alternativeMethodsBlockButton: 'hidden',
                alternativeMethodsBlockButtonText: 'hidden',
                alternativeMethodsBlockButtonIcon: 'hidden',
              }
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}