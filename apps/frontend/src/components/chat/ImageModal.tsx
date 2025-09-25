'use client';

import React, { useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  fileName?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  src,
  alt = 'Image',
  fileName = 'image',
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleRotate}
            className="w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors"
            title="Rotate"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={resetTransform}
            className="px-3 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white text-sm transition-colors"
            title="Reset"
          >
            Reset
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center gap-2 text-white transition-colors"
          title="Download Image"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        {/* Image Container */}
        <div className="relative max-w-full max-h-full overflow-hidden p-4">
          <img
            src={src}
            alt={alt}
            className="w-full h-full max-h-[60vh] object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
            draggable={false}
            onDoubleClick={resetTransform}
          />
        </div>

        {/* Image Info */}
        <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <p className="text-white text-sm">
            {fileName} • Zoom: {Math.round(zoom * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
};
