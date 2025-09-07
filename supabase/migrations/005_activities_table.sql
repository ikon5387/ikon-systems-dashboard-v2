-- Create activities table for real-time activity tracking
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'viewed', 'exported')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('client', 'project', 'appointment', 'voice_agent', 'invoice', 'payment', 'expense')),
    entity_id UUID NOT NULL,
    entity_name TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_entity_type ON public.activities(entity_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity_id ON public.activities(entity_id);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.activities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.activities FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically clean up old activities (keep last 1000 per user)
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS void AS $$
BEGIN
    DELETE FROM public.activities 
    WHERE id NOT IN (
        SELECT id 
        FROM public.activities 
        ORDER BY created_at DESC 
        LIMIT 1000
    );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clean up old activities
CREATE OR REPLACE FUNCTION trigger_cleanup_activities()
RETURNS trigger AS $$
BEGIN
    -- Only run cleanup if we have more than 1000 activities
    IF (SELECT COUNT(*) FROM public.activities) > 1000 THEN
        PERFORM cleanup_old_activities();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_activities_trigger
    AFTER INSERT ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cleanup_activities();
