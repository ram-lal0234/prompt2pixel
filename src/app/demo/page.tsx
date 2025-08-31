"use client";

import React from "react";
import { SparklesCore } from "@/components/sparkles-core";
import { GlowCard } from "@/components/glow-card";
import { motion } from "framer-motion";
import { Palette, Zap, Sparkles } from "lucide-react";

export default function DemoPage() {
  const examples = [
    {
      title: "AI Art Generation",
      description: "Transform text prompts into stunning digital artwork",
      icon: Palette,
      color: "red" as const
    },
    {
      title: "Logo Design",
      description: "Create professional logos from simple descriptions",
      icon: Zap,
      color: "blue" as const
    },
    {
      title: "Photo Enhancement",
      description: "Enhance and stylize your photos with AI magic",
      icon: Sparkles,
      color: "purple" as const
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Component Demo
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Showcasing the new animated components for Prompt2Pixel
          </p>
        </motion.div>

        {/* Sparkles Demo */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">SparklesCore Component</h2>
          <div className="relative h-64 rounded-2xl overflow-hidden border border-white/20">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1.4}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#ef4444"
              speed={1}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Animated Particles</h3>
                <p className="text-white/70">Interactive particle system</p>
              </div>
            </div>
          </div>
        </div>

        {/* GlowCard Demo */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">GlowCard Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <GlowCard glowColor={example.color} className="h-full">
                  <div className="flex flex-col h-full">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${example.color}-500/20 mb-4`}>
                      <example.icon className={`w-6 h-6 text-${example.color}-400`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{example.title}</h3>
                    <p className="text-white/70 flex-1">{example.description}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`mt-4 px-4 py-2 rounded-lg bg-${example.color}-500/20 text-${example.color}-400 font-medium hover:bg-${example.color}-500/30 transition-all`}
                    >
                      Try Now
                    </motion.button>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
