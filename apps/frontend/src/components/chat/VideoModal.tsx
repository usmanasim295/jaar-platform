'use client';

import React, { useEffect, useRef } from 'react';
import { X, Download, Maximize2 } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  fileName?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  src,
  fileName = 'video',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-white/10 backdrop-blur-sm bg-opacity-75 z-50 flex items-center justify-center p-4"
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

        {/* Fullscreen Button */}
        <button
          onClick={handleFullscreen}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center gap-2 text-white transition-colors"
          title="Download Video"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        {/* Video Container */}
        <div className="relative max-w-full max-h-full p-4">
          <video
            ref={videoRef}
            src={src}
            controls
            className="w-full h-full max-h-[60vh] object-contain"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};
