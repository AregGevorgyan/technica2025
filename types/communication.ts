// Speech output modes
export type SpeechMode = 'immediate' | 'aggregated';

// Symbol/image sources
export type SymbolSource = 'opensymbols' | 'google' | 'unsplash' | 'custom';

// Communication tile
export interface CommunicationTile {
  id: string;
  text: string;
  symbolUrl?: string;
  imageUrl?: string;
  symbolSource: SymbolSource;
  category: string;
  priority: number;
  reasoning?: string; // Why this was suggested
}

// Composed text state (for aggregated mode)
export interface ComposedText {
  segments: TextSegment[];
  fullText: string;
  timestamp: Date;
}

export interface TextSegment {
  id: string;
  text: string;
  tileId?: string;
  timestamp: Date;
}

// User preferences
export interface UserCommunicationSettings {
  inputMode: 'click' | 'eye_tracking' | 'keyboard';
  speechMode: SpeechMode;
  symbolSource: SymbolSource;
  dwellTime: number; // milliseconds for eye tracking
  tileCount: 4 | 6 | 8 | 9;
  showRegenerateButton: 'always' | 'when_stuck' | 'never';
  autoClearComposedText: boolean;
  voiceId?: string;
  tileSize: 'small' | 'medium' | 'large';
  textSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  showImages: boolean;
}

// Communication context
export interface CommunicationContext {
  timeOfDay: string;
  dayOfWeek: number;
  recentMessages: string[];
  currentCategory?: string;
  composedText?: string; // Current text in aggregated mode
  location?: string;
}

// Regenerate request
export interface RegenerateRequest {
  userId: string;
  excludePrevious: string[];
  currentContext: CommunicationContext;
  requireDifferentCategories?: boolean;
}

// Category definition
export interface Category {
  id: string;
  name: string;
  icon: string; // emoji or image URL
  subcategories?: Category[];
  commonPhrases: string[];
}

// Prediction response
export interface PredictionResponse {
  tiles: CommunicationTile[];
  suggestedCategories: string[];
  context: CommunicationContext;
}
