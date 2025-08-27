-- Create the conversations table for the AI chatbot
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversation_id TEXT NOT NULL UNIQUE,
    messages JSONB DEFAULT '[]'::jsonb
);

-- Create an index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Enable Row Level Security (RLS) - optional but recommended
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for development)
-- In production, you might want to restrict this based on user authentication
CREATE POLICY "Allow all operations" ON conversations
    FOR ALL USING (true);

-- Note: updated_at column and trigger removed to match your existing table structure

-- Optional: Create a view for easier querying of conversation statistics
CREATE OR REPLACE VIEW conversation_stats AS
SELECT 
    conversation_id,
    created_at,
    jsonb_array_length(messages) as message_count,
    messages
FROM conversations
ORDER BY created_at DESC;
