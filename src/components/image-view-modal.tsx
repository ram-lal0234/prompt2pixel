'use client';

import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageViewModalProps {
  imageData: string;
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export function ImageViewModal({ imageData, isOpen, onClose, fileName = 'image' }: ImageViewModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const resetView = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const downloadImage = useCallback(() => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `${fileName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageData, fileName]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, scale, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }, [zoomIn, zoomOut]);

  useEffect(() => {
    if (isOpen) {
      resetView();
    }
  }, [isOpen, resetView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case 'r':
          e.preventDefault();
          rotate();
          break;
        case '0':
          e.preventDefault();
          resetView();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, zoomIn, zoomOut, rotate, resetView]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={zoomIn}
          className="p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={zoomOut}
          className="p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={rotate}
          className="p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-colors"
          title="Rotate (R)"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={resetView}
          className="p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-colors"
          title="Reset View (0)"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={downloadImage}
          className="p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Image container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={`data:image/png;base64,${imageData}`}
            alt="Full size image"
            className="max-w-none max-h-none select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-gray-800/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
        <div className="text-sm">
          <div>Scale: {Math.round(scale * 100)}%</div>
          <div>Rotation: {rotation}°</div>
          <div className="text-xs text-gray-300 mt-1">
            Use mouse wheel to zoom, drag to pan, or keyboard shortcuts
          </div>
        </div>
      </div>
    </div>
  );
}
