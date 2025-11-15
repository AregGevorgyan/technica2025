-- Supabase Database Schema for Adaptive AAC System
-- Run this SQL in your Supabase SQL Editor

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input_mode VARCHAR(20) DEFAULT 'click',
  dwell_time INTEGER DEFAULT 1000,
  tile_size VARCHAR(10) DEFAULT 'medium',
  prediction_count INTEGER DEFAULT 6,
  voice_id VARCHAR(100),
  speech_mode VARCHAR(20) DEFAULT 'immediate',
  high_contrast BOOLEAN DEFAULT false,
  show_images BOOLEAN DEFAULT true,
  image_size VARCHAR(10) DEFAULT 'medium',
  symbol_source VARCHAR(20) DEFAULT 'opensymbols',
  learning_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User memories (AI's knowledge about the user)
CREATE TABLE user_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  importance FLOAT DEFAULT 0.5,
  frequency INTEGER DEFAULT 1,
  last_accessed TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Communication interactions (for learning)
CREATE TABLE communication_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context JSONB NOT NULL,
  selected_option TEXT NOT NULL,
  available_options JSONB NOT NULL,
  time_to_select INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Phrase banks (user's custom phrases)
CREATE TABLE phrase_banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50),
  phrase TEXT NOT NULL,
  image_url TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Image cache (reduce API calls)
CREATE TABLE image_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_term VARCHAR(200) UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  source VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Context snapshots (what user was doing when)
CREATE TABLE context_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  time_of_day VARCHAR(20),
  day_of_week INTEGER,
  location VARCHAR(100),
  activity TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_memories_user ON user_memories(user_id);
CREATE INDEX idx_memories_type ON user_memories(memory_type);
CREATE INDEX idx_memories_embedding ON user_memories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_interactions_user_time ON communication_interactions(user_id, created_at DESC);
CREATE INDEX idx_phrase_banks_user ON phrase_banks(user_id);
CREATE INDEX idx_image_cache_term ON image_cache(search_term);
CREATE INDEX idx_context_user_time ON context_snapshots(user_id, created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrase_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_snapshots ENABLE ROW LEVEL SECURITY;

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User memories policies
CREATE POLICY "Users can view own memories" ON user_memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON user_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON user_memories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON user_memories
  FOR DELETE USING (auth.uid() = user_id);

-- Communication interactions policies
CREATE POLICY "Users can view own interactions" ON communication_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON communication_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Phrase banks policies
CREATE POLICY "Users can view own phrases" ON phrase_banks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phrases" ON phrase_banks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own phrases" ON phrase_banks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own phrases" ON phrase_banks
  FOR DELETE USING (auth.uid() = user_id);

-- Context snapshots policies
CREATE POLICY "Users can view own snapshots" ON context_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots" ON context_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Image cache is publicly readable (shared across users)
CREATE POLICY "Anyone can read image cache" ON image_cache
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage image cache" ON image_cache
  FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_settings updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired image cache
CREATE OR REPLACE FUNCTION clean_expired_image_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM image_cache WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Schedule periodic cleanup (configure in Supabase Dashboard -> Database -> Cron)
-- Example: SELECT cron.schedule('clean-image-cache', '0 2 * * *', 'SELECT clean_expired_image_cache()');
