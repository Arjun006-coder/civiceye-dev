'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Instagram, Github } from "lucide-react";
import Link from "next/link";

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Github, href: "#", label: "GitHub" },
];

export const Footer = () => {
  return (
    <footer className="relative bg-card border-t border-border/50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
        >
          {/* Social Media Icons */}
          <div className="flex items-center space-x-4">
            {socialLinks.map(({ icon: Icon, href, label }, index) => (
              <motion.a
                key={label}
                href={href}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                className="p-3 bg-muted hover:bg-primary rounded-lg transition-all duration-300 group"
                aria-label={label}
              >
                <Icon 
                  size={20} 
                  className="text-muted-foreground group-hover:text-primary-foreground transition-colors duration-300" 
                />
              </motion.a>
            ))}
          </div>

          {/* Check Out the Team Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/team">
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Check Out the Team
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8 pt-6 border-t border-border/30"
        >
          <p className="text-sm text-muted-foreground">
            © 2024 Civic-Eye. Empowering communities through civic engagement.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};