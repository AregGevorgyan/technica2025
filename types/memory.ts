// Memory types
export type MemoryType = 'preference' | 'routine' | 'relationship' | 'interest' | 'need' | 'communication_pattern';

// User memory
export interface UserMemory {
  id: string;
  userId: string;
  memoryType: MemoryType;
  content: string; // Natural language description
  embedding?: number[]; // Vector embedding for semantic search
  importance: number; // 0-1 score
  frequency: number; // How often referenced
  lastAccessed: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// Communication interaction (for learning)
export interface CommunicationInteraction {
  id: string;
  userId: string;
  context: {
    timeOfDay: string;
    dayOfWeek: number;
    location?: string;
    recentMessages: string[];
  };
  selectedOption: string;
  availableOptions: string[];
  timeToSelect: number; // milliseconds
  createdAt: Date;
}

// Memory privacy settings
export interface MemoryPrivacySettings {
  learningEnabled: boolean;
  allowedMemoryTypes: MemoryType[];
  retentionDays: number;
  shareWithCaregivers: boolean;
  exportable: boolean;
}

// Memory query request
export interface MemoryQueryRequest {
  userId: string;
  queryText?: string;
  memoryTypes?: MemoryType[];
  limit?: number;
  minImportance?: number;
}

// Memory query response
export interface MemoryQueryResponse {
  memories: UserMemory[];
  totalCount: number;
}

// Context snapshot
export interface ContextSnapshot {
  id: string;
  userId: string;
  timeOfDay: string;
  dayOfWeek: number;
  location?: string;
  activity: string;
  createdAt: Date;
}
