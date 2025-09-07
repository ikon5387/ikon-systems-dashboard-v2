-- Update voice_agents table to match the form structure
ALTER TABLE voice_agents 
DROP COLUMN IF EXISTS client_id,
DROP COLUMN IF EXISTS agent_name,
DROP COLUMN IF EXISTS phone_number,
DROP COLUMN IF EXISTS performance_metrics,
DROP COLUMN IF EXISTS total_calls,
DROP COLUMN IF EXISTS average_call_duration,
DROP COLUMN IF EXISTS success_rate;

-- Add new columns to match the form structure
ALTER TABLE voice_agents
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'sales',
ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'gpt-4',
ADD COLUMN IF NOT EXISTS voice TEXT DEFAULT 'alloy',
ADD COLUMN IF NOT EXISTS first_message TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS system_message TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS max_duration INTEGER DEFAULT 300,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS temperature DECIMAL(3,2) DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS max_tokens INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status enum to include new values
ALTER TABLE voice_agents
DROP CONSTRAINT IF EXISTS voice_agents_status_check;

ALTER TABLE voice_agents
ADD CONSTRAINT voice_agents_status_check CHECK (status IN ('active', 'inactive', 'training', 'error'));

-- Add type constraint
ALTER TABLE voice_agents
ADD CONSTRAINT voice_agents_type_check CHECK (type IN ('sales', 'support', 'appointment', 'follow_up', 'custom'));

-- Add constraints for numeric fields
ALTER TABLE voice_agents
ADD CONSTRAINT voice_agents_max_duration_check CHECK (max_duration >= 30 AND max_duration <= 1800),
ADD CONSTRAINT voice_agents_temperature_check CHECK (temperature >= 0 AND temperature <= 2),
ADD CONSTRAINT voice_agents_max_tokens_check CHECK (max_tokens >= 1 AND max_tokens <= 4000);

-- Update existing records with default values
UPDATE voice_agents 
SET 
  name = COALESCE(name, 'Unnamed Agent'),
  first_message = COALESCE(first_message, 'Hello! How can I help you today?'),
  system_message = COALESCE(system_message, 'You are a helpful AI assistant. Be professional, friendly, and helpful.')
WHERE name IS NULL OR first_message IS NULL OR system_message IS NULL;
