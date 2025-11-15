import { supabase } from './client';
import { UserMemory, CommunicationInteraction, MemoryType } from '@/types/memory';
import { UserSettings } from '@/types/user';
import { PhraseBank } from '@/types/symbols';

// User Settings Queries
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data;
}

export async function upsertUserSettings(settings: Partial<UserSettings> & { user_id: string }) {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(settings)
    .select()
    .single();

  if (error) {
    console.error('Error upserting user settings:', error);
    throw error;
  }

  return data;
}

// Memory Queries
export async function getUserMemories(
  userId: string,
  memoryTypes?: MemoryType[],
  limit: number = 50
): Promise<UserMemory[]> {
  let query = supabase
    .from('user_memories')
    .select('*')
    .eq('user_id', userId)
    .order('importance', { ascending: false })
    .order('last_accessed', { ascending: false })
    .limit(limit);

  if (memoryTypes && memoryTypes.length > 0) {
    query = query.in('memory_type', memoryTypes);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user memories:', error);
    return [];
  }

  return data || [];
}

export async function createMemory(memory: Omit<UserMemory, 'id' | 'createdAt' | 'lastAccessed'>) {
  const { data, error } = await supabase
    .from('user_memories')
    .insert({
      user_id: memory.userId,
      memory_type: memory.memoryType,
      content: memory.content,
      embedding: memory.embedding,
      importance: memory.importance,
      frequency: memory.frequency,
      metadata: memory.metadata,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating memory:', error);
    throw error;
  }

  return data;
}

export async function updateMemory(memoryId: string, updates: Partial<UserMemory>) {
  const { data, error } = await supabase
    .from('user_memories')
    .update(updates)
    .eq('id', memoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating memory:', error);
    throw error;
  }

  return data;
}

export async function deleteMemory(memoryId: string) {
  const { error } = await supabase
    .from('user_memories')
    .delete()
    .eq('id', memoryId);

  if (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
}

// Communication Interaction Queries
export async function logInteraction(interaction: Omit<CommunicationInteraction, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('communication_interactions')
    .insert({
      user_id: interaction.userId,
      context: interaction.context,
      selected_option: interaction.selectedOption,
      available_options: interaction.availableOptions,
      time_to_select: interaction.timeToSelect,
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging interaction:', error);
    throw error;
  }

  return data;
}

export async function getRecentInteractions(userId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('communication_interactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching interactions:', error);
    return [];
  }

  return data || [];
}

// Phrase Bank Queries
export async function getUserPhrases(userId: string, category?: string): Promise<PhraseBank[]> {
  let query = supabase
    .from('phrase_banks')
    .select('*')
    .eq('user_id', userId)
    .order('usage_count', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching phrases:', error);
    return [];
  }

  return data || [];
}

export async function incrementPhraseUsage(phraseId: string) {
  const { data, error } = await supabase.rpc('increment_phrase_usage', {
    phrase_id: phraseId,
  });

  if (error) {
    console.error('Error incrementing phrase usage:', error);
  }

  return data;
}

// Image Cache Queries
export async function getCachedImage(searchTerm: string) {
  const { data, error } = await supabase
    .from('image_cache')
    .select('*')
    .eq('search_term', searchTerm.toLowerCase())
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function cacheImage(
  searchTerm: string,
  imageUrl: string,
  source: string,
  thumbnailUrl?: string
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Cache for 30 days

  const { data, error } = await supabase
    .from('image_cache')
    .upsert({
      search_term: searchTerm.toLowerCase(),
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      source,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error caching image:', error);
    throw error;
  }

  return data;
}

// Vector search for memories (requires pgvector)
export async function searchMemoriesByEmbedding(
  userId: string,
  embedding: number[],
  limit: number = 10
) {
  const { data, error } = await supabase.rpc('search_memories', {
    query_embedding: embedding,
    match_user_id: userId,
    match_count: limit,
  });

  if (error) {
    console.error('Error searching memories:', error);
    return [];
  }

  return data || [];
}
