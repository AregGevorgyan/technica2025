// Symbol sources
export type SymbolSet = 'mulberry' | 'arasaac' | 'symbolstix' | 'tawasol';

// Symbol result
export interface SymbolResult {
  symbolUrl: string;
  source: SymbolSet | 'google' | 'unsplash' | 'custom';
  license: string;
  thumbnail?: string;
}

// Symbol search request
export interface SymbolSearchRequest {
  term: string;
  userId?: string;
  preferSymbols?: boolean; // Prefer symbols over photos
  preferredSet?: SymbolSet;
}

// Image cache entry
export interface ImageCacheEntry {
  id: string;
  searchTerm: string;
  imageUrl: string;
  thumbnailUrl?: string;
  source: string;
  createdAt: Date;
  expiresAt: Date;
}

// Phrase bank entry
export interface PhraseBank {
  id: string;
  userId: string;
  category: string;
  phrase: string;
  imageUrl?: string;
  usageCount: number;
  createdAt: Date;
}
