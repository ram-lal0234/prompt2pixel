'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Palette, Type, Monitor, Eye, RotateCcw } from 'lucide-react';

export interface ThumbnailConfig {
  videoTitle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  niche: string;
  size: string;
}

const NICHE_OPTIONS = [
  { value: 'gaming', label: '🎮 Gaming', description: 'Bold, energetic fonts' },
  { value: 'business', label: '💼 Business', description: 'Professional, clean fonts' },
  { value: 'education', label: '📚 Education', description: 'Friendly, readable fonts' },
  { value: 'entertainment', label: '🎬 Entertainment', description: 'Creative, eye-catching fonts' },
  { value: 'technology', label: '💻 Technology', description: 'Modern, sleek fonts' },
  { value: 'lifestyle', label: '🌟 Lifestyle', description: 'Warm, approachable fonts' },
];

const COLOR_OPTIONS = [
  { value: '#DC2626', label: 'Red', description: 'Energetic & bold' },
  { value: '#2563EB', label: 'Blue', description: 'Professional & trust' },
  { value: '#059669', label: 'Green', description: 'Growth & nature' },
  { value: '#7C3AED', label: 'Purple', description: 'Creative & luxury' },
  { value: '#EA580C', label: 'Orange', description: 'Warm & friendly' },
  { value: '#000000', label: 'Black', description: 'Classic & elegant' },
  { value: '#FFFFFF', label: 'White', description: 'Clean & minimal' },
  { value: '#F59E0B', label: 'Yellow', description: 'Optimistic & bright' },
];

const SIZE_OPTIONS = [
  { value: '16:9', label: '16:9 (1920x1080)', description: 'YouTube standard' },
  { value: '1:1', label: '1:1 (1080x1080)', description: 'Instagram, Facebook' },
  { value: '9:16', label: '9:16 (1080x1920)', description: 'TikTok, Stories' },
];

const DEFAULT_CONFIG: ThumbnailConfig = {
  videoTitle: '',
  primaryColor: '#DC2626', // Red
  secondaryColor: '#2563EB', // Blue
  accentColor: '#000000', // Black
  niche: 'gaming',
  size: '16:9',
};

interface ThumbnailConfigProps {
  config: ThumbnailConfig;
  onConfigChange: (config: ThumbnailConfig) => void;
}

export function ThumbnailConfig({ config, onConfigChange }: ThumbnailConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localConfig, setLocalConfig] = useState<ThumbnailConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleConfigChange = (key: keyof ThumbnailConfig, value: string) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const resetToDefaults = () => {
    setLocalConfig(DEFAULT_CONFIG);
    onConfigChange(DEFAULT_CONFIG);
  };



  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-red-100 dark:border-red-900/30 p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Thumbnail Configuration</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs h-8 px-3"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Basic Settings (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Video Title</Label>
          <Input
            value={localConfig.videoTitle}
            onChange={(e) => handleConfigChange('videoTitle', e.target.value)}
            placeholder="Enter your video title..."
            className="h-9"
            maxLength={100}
          />
          <div className="text-xs text-gray-500 mt-1">
            {localConfig.videoTitle.length}/100 characters
          </div>
        </div>
        
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Niche</Label>
          <Select value={localConfig.niche} onValueChange={(value) => handleConfigChange('niche', value)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NICHE_OPTIONS.map((niche) => (
                <SelectItem key={niche.value} value={niche.value}>
                  <div className="flex items-center gap-2">
                    <span>{niche.label}</span>
                    <span className="text-xs text-gray-500">({niche.description})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Brand Colors */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Brand Colors
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Primary Color</Label>
                <Select value={localConfig.primaryColor} onValueChange={(value) => handleConfigChange('primaryColor', value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" 
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.label}</span>
                          <span className="text-xs text-gray-500">({color.description})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Secondary Color</Label>
                <Select value={localConfig.secondaryColor} onValueChange={(value) => handleConfigChange('secondaryColor', value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" 
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.label}</span>
                          <span className="text-xs text-gray-500">({color.description})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Accent Color</Label>
                <Select value={localConfig.accentColor} onValueChange={(value) => handleConfigChange('accentColor', value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" 
                            style={{ backgroundColor: color.value }}
                        />
                          <span>{color.label}</span>
                          <span className="text-xs text-gray-500">({color.description})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Thumbnail Size */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Thumbnail Size
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SIZE_OPTIONS.map((size) => (
                <div key={size.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={size.value}
                    name="size"
                    value={size.value}
                    checked={localConfig.size === size.value}
                    onChange={(e) => handleConfigChange('size', e.target.value)}
                    className="text-red-500 focus:ring-red-500"
                  />
                  <Label htmlFor={size.value} className="text-sm cursor-pointer">
                    <div className="font-medium">{size.label}</div>
                    <div className="text-xs text-gray-500">{size.description}</div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs h-8 px-3"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}

      {/* Current Settings Summary */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <span>Current:</span>
        <span className="font-medium">{NICHE_OPTIONS.find(n => n.value === localConfig.niche)?.label}</span>
        <span>•</span>
        <span className="font-medium">{SIZE_OPTIONS.find(s => s.value === localConfig.size)?.label}</span>
        {localConfig.videoTitle && (
          <>
            <span>•</span>
            <span className="font-medium">"{localConfig.videoTitle}"</span>
          </>
        )}
      </div>
    </div>
  );
}
