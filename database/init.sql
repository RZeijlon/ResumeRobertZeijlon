-- Initialize PostgreSQL database with pgvector extension
-- This script runs on first container startup

-- Create the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create content embeddings table for RAG
CREATE TABLE IF NOT EXISTS content_embeddings (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(1536), -- OpenAI ada-002 embedding size
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT unique_content_id UNIQUE(content_id)
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS content_embeddings_embedding_idx 
ON content_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for content_id lookups
CREATE INDEX IF NOT EXISTS content_embeddings_content_id_idx 
ON content_embeddings(content_id);

-- Create index for file_path lookups
CREATE INDEX IF NOT EXISTS content_embeddings_file_path_idx 
ON content_embeddings(file_path);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_embeddings_updated_at 
    BEFORE UPDATE ON content_embeddings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create chat conversations table (for future use)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create chat messages table (for future use)
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes for chat tables
CREATE INDEX IF NOT EXISTS conversations_session_id_idx ON conversations(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_conversation_id_idx ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS chat_messages_timestamp_idx ON chat_messages(timestamp);

-- Insert some sample data for testing
INSERT INTO content_embeddings (content_id, file_path, content, metadata) VALUES
('hero', 'sections/hero.md', 'AI Developer & Infrastructure Enthusiast - Specializing in local AI models, self-hosted solutions, and cutting-edge machine learning technologies', '{"section": "hero", "title": "AI Developer & Infrastructure Enthusiast"}'),
('about', 'sections/about.md', 'Recent AI Developer graduate with a passion for cutting-edge artificial intelligence and machine learning technologies.', '{"section": "about", "title": "About Me"}')
ON CONFLICT (content_id) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO portfolio;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO portfolio;

-- Print completion message
DO $$ 
BEGIN 
    RAISE NOTICE 'Database initialization completed successfully!';
    RAISE NOTICE 'Created tables: content_embeddings, conversations, chat_messages';
    RAISE NOTICE 'Installed pgvector extension for similarity search';
END $$;