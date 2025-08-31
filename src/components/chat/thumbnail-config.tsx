"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Palette,
  Monitor,
  RotateCcw,
  Upload,
  X,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

export interface ThumbnailConfig {
  videoTitle: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  defaultImage: string;
  defaultImagePreview?: string;
  niche: string;
  size: string;
}

const NICHE_OPTIONS = [
  { value: "gaming", label: "🎮 Gaming", description: "Bold, energetic fonts" },
  {
    value: "business",
    label: "💼 Business",
    description: "Professional, clean fonts",
  },
  {
    value: "education",
    label: "📚 Education",
    description: "Friendly, readable fonts",
  },
  {
    value: "entertainment",
    label: "🎬 Entertainment",
    description: "Creative, eye-catching fonts",
  },
  {
    value: "technology",
    label: "💻 Technology",
    description: "Modern, sleek fonts",
  },
  {
    value: "lifestyle",
    label: "🌟 Lifestyle",
    description: "Warm, approachable fonts",
  },
];

const SIZE_OPTIONS = [
  { value: "16:9", label: "16:9 (1920x1080)", description: "YouTube standard" },
  {
    value: "1:1",
    label: "1:1 (1080x1080)",
    description: "Instagram, Facebook",
  },
  { value: "9:16", label: "9:16 (1080x1920)", description: "TikTok, Stories" },
];

const DEFAULT_CONFIG: ThumbnailConfig = {
  videoTitle: "",
  description: "",
  primaryColor: "#DC2626", // Red
  secondaryColor: "#2563EB", // Blue
  defaultImage: "",
  defaultImagePreview: "",
  niche: "education",
  size: "16:9",
};

interface ThumbnailConfigProps {
  config: ThumbnailConfig;
  onConfigChange: (config: ThumbnailConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  showGenerateButton?: boolean;
  className?: string;
}

export function ThumbnailConfig({
  config,
  onConfigChange,
  onGenerate,
  isGenerating = false,
  showGenerateButton = true,
  className,
}: ThumbnailConfigProps) {
  const [localConfig, setLocalConfig] = useState<ThumbnailConfig>(config);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleConfigChange = (key: keyof ThumbnailConfig, value: string) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newConfig = {
          ...localConfig,
          defaultImage: file.name,
          defaultImagePreview: result,
        };
        setLocalConfig(newConfig);
        onConfigChange(newConfig);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDefaultImage = () => {
    const newConfig = {
      ...localConfig,
      defaultImage: "",
      defaultImagePreview: "",
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const ColorPicker = ({
    color,
    onChange,
    label,
  }: {
    color: string;
    onChange: (color: string) => void;
    label: string;
  }) => (
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-16">
        {label}
      </Label>
      <div className="relative">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer shadow-sm"
        />
      </div>
      <Input
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-8 text-xs font-mono bg-gray-50 dark:bg-gray-800"
        placeholder="#000000"
      />
    </div>
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Compact Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Reference Image Section - At Top */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-red-500" />
            Reference Image
          </Label>

          {localConfig.defaultImagePreview ? (
            // Show selected image
            <div className="space-y-2">
              <div className="relative group">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img
                    src={localConfig.defaultImagePreview}
                    alt="Reference image preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={removeDefaultImage}
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 p-0 rounded-full shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{localConfig.defaultImage}</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Change Image
                </button>
              </div>
            </div>
          ) : (
            // Show upload section
            <div className="space-y-2">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 hover:border-red-400 dark:hover:border-red-500 transition-colors">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Upload Reference Image
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Add an image for inspiration
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Choose Image
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Supports JPG, PNG, WebP • Max 5MB
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-900 dark:text-white">
            Content Details
          </Label>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Video Title *
              </Label>
              <Input
                value={localConfig.videoTitle}
                onChange={(e) =>
                  handleConfigChange("videoTitle", e.target.value)
                }
                placeholder="Enter your video title..."
                className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-500"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">
                {localConfig.videoTitle.length}/100 characters
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Description (Optional)
              </Label>
              <textarea
                value={localConfig.description}
                onChange={(e) =>
                  handleConfigChange("description", e.target.value)
                }
                placeholder="Describe your video content or thumbnail style..."
                className="w-full h-16 px-3 py-2 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:border-red-500 dark:focus:border-red-500"
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1">
                {localConfig.description.length}/200 characters
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Content Niche
                </Label>
                <Select
                  value={localConfig.niche}
                  onValueChange={(value) => handleConfigChange("niche", value)}
                >
                  <SelectTrigger className="h-10 border-2 border-gray-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHE_OPTIONS.map((niche) => (
                      <SelectItem key={niche.value} value={niche.value}>
                        <div className="flex items-center gap-2">
                          <span>{niche.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Thumbnail Size
                </Label>
                <Select
                  value={localConfig.size}
                  onValueChange={(value) => handleConfigChange("size", value)}
                >
                  <SelectTrigger className="h-10 border-2 border-gray-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        <div className="flex items-center gap-2">
                          <span>{size.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Style Section */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-red-500" />
            Style Settings
          </Label>

          <div className="space-y-2">
            <ColorPicker
              color={localConfig.primaryColor}
              onChange={(color) => handleConfigChange("primaryColor", color)}
              label="Primary"
            />
            <ColorPicker
              color={localConfig.secondaryColor}
              onChange={(color) => handleConfigChange("secondaryColor", color)}
              label="Secondary"
            />
          </div>
        </div>
      </div>

      {/* Sticky Generate Button */}
      {showGenerateButton && onGenerate && (
        <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !localConfig.videoTitle.trim()}
            className="w-full px-6 py-2 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 hover:from-red-600 hover:via-red-700 hover:to-orange-600 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden group"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Thumbnail</span>
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
