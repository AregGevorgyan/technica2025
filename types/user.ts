import { UserCommunicationSettings } from './communication';
import { MemoryPrivacySettings } from './memory';
import { SymbolSet } from './symbols';

// User profile
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User settings (extends communication settings)
export interface UserSettings extends UserCommunicationSettings {
  id: string;
  userId: string;
  predictionCount: number;
  imageSize: 'small' | 'medium' | 'large' | 'off';
  symbolSet: SymbolSet;
  learningEnabled: boolean;
  memoryPrivacy: MemoryPrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

// Default user settings
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  inputMode: 'click',
  speechMode: 'immediate',
  symbolSource: 'opensymbols',
  dwellTime: 1000,
  tileCount: 6,
  showRegenerateButton: 'always',
  autoClearComposedText: false,
  tileSize: 'medium',
  textSize: 'medium',
  highContrast: false,
  showImages: true,
  predictionCount: 6,
  imageSize: 'medium',
  symbolSet: 'mulberry',
  learningEnabled: true,
  memoryPrivacy: {
    learningEnabled: true,
    allowedMemoryTypes: ['preference', 'routine', 'relationship', 'interest', 'need', 'communication_pattern'],
    retentionDays: 365,
    shareWithCaregivers: false,
    exportable: true,
  },
};
