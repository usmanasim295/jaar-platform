'use client';

import React from 'react';

export const ChatListSkeleton = () => {
  return (
    <div className="p-6 space-y-4">
      {/* Tabs skeleton */}
      <div className="flex justify-center p-[6px] gap-2 rounded-lg border border-[#E5E5E5]">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-8 w-16 bg-gray-200 rounded-[6px] animate-pulse"
          />
        ))}
      </div>

      {/* Search skeleton */}
      <div className="p-2 rounded-[10px] border border-[#E5E5E5]">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Chat items skeleton */}
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="px-6 py-[14px] flex gap-2 justify-between">
          <div className="flex gap-2">
            <div className="w-[45px] h-[45px] bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export const MessageSkeleton = () => {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`flex items-start gap-2 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          {i % 2 !== 0 && (
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
          )}
          <div
            className={`max-w-[85%] p-3 rounded-xl ${i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'}`}
          >
            <div className="h-4 w-48 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="h-3 w-16 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChatHeaderSkeleton = () => {
  return (
    <div className="flex items-center gap-3 pt-4 pb-5 pl-6">
      <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
      <div className="space-y-2">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
};

export const EmptyState = ({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{description}</p>
    </div>
  );
};
