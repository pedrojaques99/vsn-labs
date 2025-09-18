'use client'

import React from 'react'

interface SlotSkeletonProps {
  gridLayout: 1 | 2 | 4
}

export default function SlotSkeleton({ gridLayout }: SlotSkeletonProps) {
  const getButtonPadding = () => {
    switch (gridLayout) {
      case 4:
        return 'px-1 py-1'
      case 2:
        return 'px-2 py-1.5'
      case 1:
      default:
        return 'px-3 py-2'
    }
  }

  const getIconSize = () => {
    switch (gridLayout) {
      case 4:
        return 8
      case 2:
        return 10
      case 1:
      default:
        return 12
    }
  }

  return (
    <div className="glass-theme rounded-lg p-4 animate-pulse h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-[var(--theme-glass-hover)] rounded w-16"></div>
        <div className="h-6 bg-[var(--theme-glass-hover)] rounded w-6"></div>
      </div>

      {/* Video Thumbnail */}
      <div className="aspect-video bg-[var(--theme-glass-hover)] rounded mb-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-glass-hover)] to-[var(--theme-glass-hover)]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-[var(--theme-glass-hover)] rounded-full"></div>
        </div>
      </div>

      {/* Title */}
      <div className="h-4 bg-[var(--theme-glass-hover)] rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-[var(--theme-glass-hover)] rounded w-1/2 mb-4"></div>

      {/* Controls Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          <div className={`h-6 bg-[var(--theme-glass-hover)] rounded ${getButtonPadding()}`}></div>
          <div className={`h-6 bg-[var(--theme-glass-hover)] rounded ${getButtonPadding()}`}></div>
          <div className={`h-6 bg-[var(--theme-glass-hover)] rounded ${getButtonPadding()}`}></div>
        </div>
        <div className="flex gap-1">
          <div className={`h-6 bg-[var(--theme-glass-hover)] rounded ${getButtonPadding()}`}></div>
          <div className={`h-6 bg-[var(--theme-glass-hover)] rounded ${getButtonPadding()}`}></div>
        </div>
      </div>

      {/* Volume Slider */}
      <div className="space-y-2 flex-1 flex flex-col justify-end">
        <div className="h-2 bg-[var(--theme-glass-hover)] rounded w-full"></div>
        <div className="flex justify-between text-xs">
          <div className="h-3 bg-[var(--theme-glass-hover)] rounded w-8"></div>
          <div className="h-3 bg-[var(--theme-glass-hover)] rounded w-8"></div>
        </div>
      </div>
    </div>
  )
}
