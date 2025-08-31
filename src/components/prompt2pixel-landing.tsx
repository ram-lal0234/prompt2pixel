"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { ChevronRight, Zap, Palette, Sparkles, ArrowRight, Video, TrendingUp, Target, Play, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparklesCore } from "./sparkles-core";
import { GlowCard } from "./glow-card";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "./theme-provider";

// Main Landing Page Component
const Prompt2PixelLanding = () => {
  const color = useMotionValue("#ef4444");
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const handleGetStarted = () => {
    router.push("/chat");
  };

  useEffect(() => {
    setIsLoaded(true);
    animate(color, ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ef4444"], {
      ease: "easeInOut",
      duration: 8,
      repeat: Infinity,
      repeatType: "loop",
    });
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, ${theme === 'dark' ? '#0f0f0f' : '#ffffff'} 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  const examples = [
    {
      title: "Gaming Thumbnail",
      description: "Dynamic gaming thumbnail with vibrant colors and action-packed composition",
      image: "/examples/prompt2pixel-thumbnail-1756640481071.png",
      category: "Gaming"
    },
    {
      title: "Educational Content",
      description: "Professional educational thumbnail with clear typography and academic styling",
      image: "/examples/prompt2pixel-1756640541069.png",
      category: "Education"
    },
    {
      title: "Entertainment Video",
      description: "Eye-catching entertainment thumbnail with creative composition and engaging visuals",
      image: "/examples/prompt2pixel-thumbnail-1756636028061.png",
      category: "Entertainment"
    },
    {
      title: "Business Presentation",
      description: "Professional business thumbnail with corporate aesthetics and clean design",
      image: "/examples/prompt2pixel-1756630084988.png",
      category: "Business"
    }
  ];

  return (
    <motion.div
      style={{ backgroundImage }}
      className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20 text-gray-900 dark:text-white relative overflow-hidden"
    >
      {/* Sparkles Background */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor={theme === 'dark' ? "#ef4444" : "#dc2626"}
          speed={1}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P2P</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Prompt2Pixel
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center space-x-6"
        >
          <a href="#features" className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
          <a href="#examples" className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors">Examples</a>
          <a href="#pricing" className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
          
          {/* Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          
          <SignedIn>
            <motion.button
              onClick={handleGetStarted}
              style={{ border, boxShadow }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium transition-all"
            >
              Start Creating
            </motion.button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <motion.button
                style={{ border, boxShadow }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium transition-all"
              >
                Sign In & Start
              </motion.button>
            </SignInButton>
          </SignedOut>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-40 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Thumbnail Generator
            <ChevronRight className="w-4 h-4 ml-2" />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-gray-900 via-red-600 to-orange-600 dark:from-white dark:via-red-200 dark:to-orange-200 bg-clip-text text-transparent">
            Transform
          </span>
          <br />
          <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 dark:from-red-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent">
            Prompts
          </span>
          <br />
          <span className="text-gray-900 dark:text-white">to Pixels</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-xl md:text-2xl text-gray-600 dark:text-white/80 mb-8 max-w-3xl leading-relaxed"
        >
          The most powerful AI thumbnail generation platform. Create eye-catching thumbnails that boost your click-through rates and drive more views.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <SignedIn>
            <motion.button
              onClick={handleGetStarted}
              style={{ border, boxShadow }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold text-lg flex items-center justify-center group"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <motion.button
                style={{ border, boxShadow }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold text-lg flex items-center justify-center group"
              >
                Sign In & Create
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </SignInButton>
          </SignedOut>
          <motion.button
            onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white font-semibold text-lg backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            View Examples
          </motion.button>
        </motion.div>
      </div>

      {/* Examples Section */}
      <div id="examples" className="relative z-40 px-4 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 dark:via-black/5 to-transparent"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto relative"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                className="group"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "easeInOut"
                }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={example.image}
                      alt={example.title}
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                    
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500/50 via-orange-500/50 to-yellow-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  
                  {/* Pulse Effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/30 via-orange-500/30 to-yellow-500/30 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-20 animate-pulse"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="relative z-40 px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-red-400 mb-2">100K+</div>
              <div className="text-gray-600 dark:text-white/70">Thumbnails Generated</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">10K+</div>
              <div className="text-gray-600 dark:text-white/70">Content Creators</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">95%</div>
              <div className="text-gray-600 dark:text-white/70">Click Rate Boost</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="relative z-40 px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-red-600 dark:from-white dark:to-red-200 bg-clip-text text-transparent">
            Ready to Create Magic?
          </h2>
          <p className="text-xl text-gray-600 dark:text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who are already boosting their views with AI-generated thumbnails.
          </p>
          <SignedIn>
            <motion.button
              onClick={handleGetStarted}
              style={{ border, boxShadow }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold text-xl"
            >
              Start Creating
            </motion.button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <motion.button
                style={{ border, boxShadow }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold text-xl"
              >
                Sign In & Start Creating
              </motion.button>
            </SignInButton>
          </SignedOut>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Prompt2PixelLanding;
