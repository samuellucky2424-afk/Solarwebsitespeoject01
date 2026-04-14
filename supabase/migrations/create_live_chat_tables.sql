-- Create conversations table
CREATE TABLE IF NOT EXISTS live_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, closed, waiting_admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  assigned_admin_id UUID,
  CONSTRAINT email_format CHECK (visitor_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create messages table
CREATE TABLE IF NOT EXISTS live_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES live_chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'visitor', 'bot', 'admin'
  sender_id UUID, -- NULL for bot, admin_id for admin
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_sender_type CHECK (sender_type IN ('visitor', 'bot', 'admin'))
);

-- Create indexes
CREATE INDEX idx_conversations_email ON live_chat_conversations(visitor_email);
CREATE INDEX idx_conversations_status ON live_chat_conversations(status);
CREATE INDEX idx_messages_conversation ON live_chat_messages(conversation_id);
CREATE INDEX idx_messages_created ON live_chat_messages(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE live_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Allow anonymous read" ON live_chat_conversations
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON live_chat_conversations
  FOR INSERT WITH CHECK (true);

-- RLS Policies for messages
CREATE POLICY "Allow anonymous read messages" ON live_chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert messages" ON live_chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update messages" ON live_chat_messages
  FOR UPDATE USING (true);
