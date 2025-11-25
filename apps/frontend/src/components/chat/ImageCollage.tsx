'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageItem {
  src: string;
  alt: string;
  fileName: string;
}

interface ImageCollageProps {
  images: ImageItem[];
  className?: string;
}

const ImageCollage: React.FC<ImageCollageProps> = ({
  images,
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedIndex(null);
  };

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(
        selectedIndex > 0 ? selectedIndex - 1 : images.length - 1
      );
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(
        selectedIndex < images.length - 1 ? selectedIndex + 1 : 0
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseModal();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  const renderCollage = () => {
    if (images.length === 1) {
      return (
        <div className="relative w-full max-h-64 rounded-lg overflow-hidden">
          <img
            src={images[0].src}
            alt={images[0].alt}
            className="w-full h-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleImageClick(0)}
          />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-48">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(index)}
              />
            </div>
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-48">
          <div className="relative h-48">
            <img
              src={images[0].src}
              alt={images[0].alt}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(0)}
            />
          </div>
          <div className="grid grid-rows-2 gap-1 h-48">
            <div className="relative h-full">
              <img
                src={images[1].src}
                alt={images[1].alt}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(1)}
              />
            </div>
            <div className="relative h-full">
              <img
                src={images[2].src}
                alt={images[2].alt}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(2)}
              />
            </div>
          </div>
        </div>
      );
    }

    // 4 or more images
    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-h-48">
        {images.slice(0, 4).map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full max-h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(index)}
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className={className}>{renderCollage()}</div>

      {/* Modal for viewing images */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-white/10 backdrop-blur-sm bg-opacity-75 z-[100] flex items-center justify-center p-4"
          onClick={handleCloseModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image container with fixed dimensions */}
            <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center">
              <img
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{ maxHeight: '85vh' }}
              />
            </div>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCollage;
