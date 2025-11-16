'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CommunicationTile } from '@/types/communication';

interface SymbolTileProps {
  tile: CommunicationTile;
  onSelect: (tile: CommunicationTile) => void;
  size?: 'small' | 'medium' | 'large';
  showImage?: boolean;
  highContrast?: boolean;
  dwellTime?: number;
  isGazing?: boolean;
  gazeProgress?: number;
}

export default function SymbolTile({
  tile,
  onSelect,
  size = 'medium',
  showImage = true,
  highContrast = false,
  dwellTime = 1000,
  isGazing = false,
  gazeProgress = 0,
}: SymbolTileProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-xs sm:text-sm',
    medium: 'w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 text-sm sm:text-base',
    large: 'w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 text-base sm:text-lg',
  };

  const imageSizes = {
    small: 56,
    medium: 72,
    large: 88,
  };

  const handleClick = () => {
    onSelect(tile);
  };

  const imageUrl = tile.symbolUrl || tile.imageUrl;
  const shouldShowImage = showImage && imageUrl && !imageError;

  return (
    <button
      onClick={handleClick}
      data-gaze-target="true"
      data-tile-id={tile.id}
      className={`
        ${sizeClasses[size]}
        relative flex flex-col items-center justify-center gap-2 p-3 md:p-4
        bg-[var(--tile-bg)] rounded-xl shadow-md
        hover:shadow-lg hover:scale-105
        transition-all duration-200
        border-2 ${highContrast ? 'border-[var(--tile-border)]' : 'border-[var(--tile-border)]'}
        ${isGazing ? 'ring-4 ring-blue-500' : ''}
        focus:outline-none focus:ring-4 focus:ring-blue-400
      `}
      aria-label={tile.text}
    >
      {/* Dwell progress indicator for eye tracking */}
      {isGazing && gazeProgress > 0 && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div
            className="absolute inset-0 bg-[var(--tile-bg)] opacity-30"
            style={{
              clipPath: `circle(${gazeProgress}% at 50% 50%)`,
              transition: 'clip-path 50ms linear',
            }}
          />
        </div>
      )}

      {/* Image/Symbol */}
      {shouldShowImage && (
        <div className="relative" style={{ width: imageSizes[size], height: imageSizes[size] }}>
          <Image
            src={imageUrl}
            alt={tile.text}
            fill
            className="object-contain"
            onError={() => setImageError(true)}
            sizes={`${imageSizes[size]}px`}
          />
        </div>
      )}

      {/* Text */}
      <span className={`font-semibold text-center ${highContrast ? 'text-[var(--tile-text)]' : 'text-[var(--tile-text)]'}`}>
        {tile.text}
      </span>

      {/* Category badge (optional) */}
      {tile.category && (
        <span className="absolute top-1 right-1 text-xs bg-[var(--tile-bg)] px-2 py-0.5 rounded-full text-[var(--tile-bg)]">
          {tile.category}
        </span>
      )}
    </button>
  );
}
