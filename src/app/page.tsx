"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Download, Sparkles, Palette, Wand2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/20">
      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-6">
              {/* Icon Only Logo */}
              <div className="relative">
                <Image
                  src="/image.png"
                  alt="Prompt2Pixel Icon"
                  width={64}
                  height={64}
                  className="w-16 h-16"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              
              {/* Full Logo */}
              <Image
                src="/Prompt2Pixel_logo.png"
                alt="Prompt2Pixel Logo"
                width={200}
                height={64}
                className="w-48 h-16 hidden md:block"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent mb-6">
            Prompt2Pixel
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into stunning images with AI.
            <span className="text-red-600 dark:text-red-400 font-semibold">
              {" "}
              Prompt-based generation at its finest.
            </span>
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>AI-Powered</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Palette className="w-4 h-4 text-red-500" />
              <span>Creative Freedom</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Wand2 className="w-4 h-4 text-red-500" />
              <span>Instant Results</span>
            </div>
          </div>

          <SignedIn>
            <div className="space-y-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white"
              >
                Start Creating
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="space-y-6">
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white"
                >
                  Get Started
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </SignInButton>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Free to start • No credit card required
              </p>
            </div>
          </SignedOut>
        </div>

        {/* Features Section with Bento Grid */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to transform your ideas into stunning AI-generated images
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-7 gap-4 auto-rows-fr">
            {/* Large Feature Card - Upload */}
            <div className="md:col-span-4 md:row-span-4 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 p-8 border border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700/50 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Simple Upload
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-md">
                    Upload any image and our AI will intelligently process it for perfect composition and enhancement. Support for all major formats.
                  </p>
                </div>
                <div className="mt-6">
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
                    <span>Drag & Drop</span>
                    <span>•</span>
                    <span>Multiple Formats</span>
                    <span>•</span>
                    <span>Smart Processing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Feature Card - AI Magic */}
            <div className="md:col-span-2 md:row-span-4 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 p-6 border border-purple-200 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    AI Magic
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Describe your vision and watch AI generate stunning images with professional quality.
                  </p>
                </div>
              </div>
            </div>

            {/* Small Feature Card - Instant Results */}
            <div className="md:col-span-2 md:row-span-3 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 p-6 border border-green-200 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700/50 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Instant Results
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Generate images in seconds with our optimized AI models.
                  </p>
                </div>
              </div>
            </div>

            {/* Medium Feature Card - Creative Freedom */}
            <div className="md:col-span-3 md:row-span-3 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 p-6 border border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Creative Freedom
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Unlimited creative possibilities with customizable prompts and styles.
                  </p>
                </div>
              </div>
            </div>

            {/* Small Feature Card - High Quality */}
            <div className="md:col-span-3 md:row-span-3 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 p-6 border border-orange-200 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700/50 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    High Quality
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Professional-grade images suitable for commercial use.
                  </p>
                </div>
              </div>
            </div>

            {/* Large Feature Card - Ready to Use */}
            <div className="md:col-span-6 md:row-span-3 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 p-8 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Ready to Use
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                      Download your generated images instantly in multiple formats. Perfect for social media, websites, and creative projects.
                    </p>
                  </div>
                  <div className="hidden lg:flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>PNG, JPG, WebP</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>High Resolution</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Commercial License</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-20 border border-red-100 dark:border-red-900/30">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                10K+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Images Generated
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                99%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Satisfaction Rate
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                30s
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Average Generation Time
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to Transform Your Ideas?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using AI to transform
            their ideas into stunning images.
          </p>

          <SignedIn>
            <div className="space-y-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white"
              >
                Start Creating Now
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white"
              >
                Start Creating Now
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </main>
    </div>
  );
}
