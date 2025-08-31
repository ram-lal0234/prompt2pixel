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
import { Palette, Monitor, RotateCcw, Upload, X } from "lucide-react";

export interface ThumbnailConfig {
  videoTitle: string;
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
}

export function ThumbnailConfig({
  config,
  onConfigChange,
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

  const resetToDefaults = () => {
    setLocalConfig(DEFAULT_CONFIG);
    onConfigChange(DEFAULT_CONFIG);
  };

  // Reset only the video title
  const resetTitle = () => {
    const newConfig = { ...localConfig, videoTitle: '' };
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
      <Label className="text-xs text-gray-600 dark:text-gray-400 min-w-16">
        {label}
      </Label>
      <div className="relative">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
      </div>
      <Input
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 text-xs font-mono"
        placeholder="#000000"
      />
    </div>
  );

  return (
    <div className="h-full bg-transparent">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Thumbnail Settings
        </h3>
      </div>

      {/* Basic Settings */}
      <div className="space-y-4 mb-4">
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Video Title
          </Label>
          <Input
            value={localConfig.videoTitle}
            onChange={(e) => handleConfigChange("videoTitle", e.target.value)}
            placeholder="Enter your video title..."
            className="h-9"
            maxLength={100}
          />
          <div className="text-xs text-gray-500 mt-1">
            {localConfig.videoTitle.length}/100 characters
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            Niche
          </Label>
          <Select
            value={localConfig.niche}
            onValueChange={(value) => handleConfigChange("niche", value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NICHE_OPTIONS.map((niche) => (
                <SelectItem key={niche.value} value={niche.value}>
                  <div className="flex items-center gap-2">
                    <span>{niche.label}</span>
                    <span className="text-xs text-gray-500">
                      ({niche.description})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="space-y-4 mb-4">
        <Label className="text-sm font-medium text-gray-900 dark:text-white block flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Brand Colors
        </Label>
        <div className="space-y-3">
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
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Default Image
            </Label>

            {localConfig.defaultImagePreview ? (
              <div className="space-y-2">
                {/* Image Preview */}
                <div className="relative">
                  <img
                    src={localConfig.defaultImagePreview}
                    alt="Default image preview"
                    className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeDefaultImage}
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* File Name */}
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {localConfig.defaultImage}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* File Upload Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-9 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                </Button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="text-xs text-gray-500">
                  Optional: Add a default image for this chat (max 5MB)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail Size */}
      <div className="space-y-4 mb-4">
        <Label className="text-sm font-medium text-gray-900 dark:text-white block flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Thumbnail Size
        </Label>
        <Select
          value={localConfig.size}
          onValueChange={(value) => handleConfigChange("size", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                <div className="flex items-center gap-2">
                  <span>{size.label}</span>
                  <span className="text-xs text-gray-500">
                    ({size.description})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
  );
}
