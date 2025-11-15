'use client';

import React from 'react';
import SymbolTile from './SymbolTile';
import { CommunicationTile } from '@/types/communication';

interface AdaptiveTileGridProps {
  tiles: CommunicationTile[];
  onTileSelect: (tile: CommunicationTile) => void;
  tileCount?: 4 | 6 | 8 | 9;
  tileSize?: 'small' | 'medium' | 'large';
  showImages?: boolean;
  highContrast?: boolean;
  gazeData?: {
    gazingTileId?: string;
    gazeProgress?: number;
  };
}

export default function AdaptiveTileGrid({
  tiles,
  onTileSelect,
  tileCount = 6,
  tileSize = 'medium',
  showImages = true,
  highContrast = false,
  gazeData,
}: AdaptiveTileGridProps) {
  // Limit tiles to the specified count
  const displayTiles = tiles.slice(0, tileCount);

  // Determine grid layout based on tile count (responsive)
  const gridClasses = {
    4: 'grid-cols-2 gap-3 md:gap-4',
    6: 'grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4',
    8: 'grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4',
    9: 'grid-cols-3 gap-3 md:gap-4',
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
      <div className={`grid ${gridClasses[tileCount]} place-items-center justify-center`}>
        {displayTiles.map((tile) => (
          <SymbolTile
            key={tile.id}
            tile={tile}
            onSelect={onTileSelect}
            size={tileSize}
            showImage={showImages}
            highContrast={highContrast}
            isGazing={gazeData?.gazingTileId === tile.id}
            gazeProgress={gazeData?.gazingTileId === tile.id ? gazeData.gazeProgress : 0}
          />
        ))}
      </div>
    </div>
  );
}
