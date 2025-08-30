'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Eye } from 'lucide-react';
import { ThumbnailConfig } from './thumbnail-config';

interface ThumbnailPreviewProps {
  config: ThumbnailConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function ThumbnailPreview({ config, isOpen, onClose }: ThumbnailPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const getSizeDimensions = (size: string) => {
    switch (size) {
      case '16:9':
        return { width: 1920, height: 1080, displayWidth: 480, displayHeight: 270 };
      case '1:1':
        return { width: 1080, height: 1080, displayWidth: 360, displayHeight: 360 };
      case '9:16':
        return { width: 1080, height: 1920, displayWidth: 270, displayHeight: 480 };
      default:
        return { width: 1920, height: 1080, displayWidth: 480, displayHeight: 270 };
    }
  };

  const dimensions = getSizeDimensions(config.size);

  const getNicheStyle = (niche: string) => {
    switch (niche) {
      case 'gaming':
        return { fontFamily: 'Impact, sans-serif', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' };
      case 'business':
        return { fontFamily: 'Arial, sans-serif', fontWeight: '600', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' };
      case 'education':
        return { fontFamily: 'Georgia, serif', fontWeight: '500', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' };
      case 'entertainment':
        return { fontFamily: 'Comic Sans MS, cursive', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' };
      case 'technology':
        return { fontFamily: 'Courier New, monospace', fontWeight: '600', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' };
      case 'lifestyle':
        return { fontFamily: 'Verdana, sans-serif', fontWeight: '500', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' };
      default:
        return { fontFamily: 'Arial, sans-serif', fontWeight: '600', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' };
    }
  };

  const nicheStyle = getNicheStyle(config.niche);

  const handleGenerate = async () => {
    setIsLoading(true);
    // Here you would integrate with your AI generation API
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setIsLoading(false);
      // Handle the generation result
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thumbnail Preview</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview Area */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
              
              {/* Thumbnail Preview */}
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div
                  className="relative mx-auto"
                  style={{
                    width: dimensions.displayWidth,
                    height: dimensions.displayHeight,
                  }}
                >
                  {/* Background with brand colors */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${config.primaryColor}20 0%, ${config.secondaryColor}20 100%)`,
                    }}
                  />
                  
                  {/* Sample content for preview */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    {config.videoTitle ? (
                      <div
                        className="text-white px-4 py-2 rounded-lg"
                        style={{
                          ...nicheStyle,
                          backgroundColor: config.primaryColor,
                          fontSize: Math.max(12, Math.min(24, 24 - config.videoTitle.length / 4)),
                        }}
                      >
                        {config.videoTitle}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">Enter a video title to see preview</div>
                    )}
                    
                    {/* Sample elements */}
                    <div className="mt-4 flex gap-2">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: config.secondaryColor }}
                      />
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: config.accentColor }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Size indicator */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {dimensions.width} × {dimensions.height}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !config.videoTitle}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Generate Thumbnail
                  </div>
                )}
              </Button>
            </div>

            {/* Configuration Summary */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h3>
              
              {/* Video Title */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Video Title</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {config.videoTitle || (
                    <span className="text-gray-400 italic">No title entered</span>
                  )}
                </div>
              </div>

              {/* Niche */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Niche & Style</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {config.niche === 'gaming' && '🎮'}
                      {config.niche === 'business' && '💼'}
                      {config.niche === 'education' && '📚'}
                      {config.niche === 'entertainment' && '🎬'}
                      {config.niche === 'technology' && '💻'}
                      {config.niche === 'lifestyle' && '🌟'}
                    </span>
                    <span className="capitalize">{config.niche}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {config.niche === 'gaming' && 'Bold, energetic fonts'}
                    {config.niche === 'business' && 'Professional, clean fonts'}
                    {config.niche === 'education' && 'Friendly, readable fonts'}
                    {config.niche === 'entertainment' && 'Creative, eye-catching fonts'}
                    {config.niche === 'technology' && 'Modern, sleek fonts'}
                    {config.niche === 'lifestyle' && 'Warm, approachable fonts'}
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Brand Colors</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-lg mx-auto mb-2 border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: config.primaryColor }}
                    />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Primary</div>
                    <div className="text-xs font-mono text-gray-500">{config.primaryColor}</div>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-lg mx-auto mb-2 border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: config.secondaryColor }}
                    />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Secondary</div>
                    <div className="text-xs font-mono text-gray-500">{config.secondaryColor}</div>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-lg mx-auto mb-2 border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: config.accentColor }}
                    />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Accent</div>
                    <div className="text-xs font-mono text-gray-500">{config.accentColor}</div>
                  </div>
                </div>
              </div>

              {/* Thumbnail Size */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Thumbnail Size</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium">{dimensions.width} × {dimensions.height}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {config.size === '16:9' && 'YouTube standard'}
                    {config.size === '1:1' && 'Instagram, Facebook'}
                    {config.size === '9:16' && 'TikTok, Stories'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
