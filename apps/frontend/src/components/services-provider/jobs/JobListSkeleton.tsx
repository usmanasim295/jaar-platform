'use client';
import React from 'react';

interface JobListSkeletonProps {
  count?: number;
}

export default function JobListSkeleton({ count = 3 }: JobListSkeletonProps) {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-dark bg-[#ffffff] animate-pulse"
          >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="h-5 sm:h-6 w-36 sm:w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 sm:w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-3 sm:mb-4"></div>
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
              <div className="h-7 sm:h-8 w-20 sm:w-24 bg-gray-200 rounded"></div>
              <div className="h-7 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded"></div>
              <div className="h-7 sm:h-8 w-24 sm:w-28 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-48 sm:w-64 bg-gray-200 rounded"></div>
              <div className="h-7 sm:h-8 w-14 sm:w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
    </>
  );
}
