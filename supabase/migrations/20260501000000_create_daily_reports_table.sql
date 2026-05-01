-- Create daily_reports table for sales reporting to CEO dashboard
-- This table stores daily sales metrics submitted by sales staff

CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reporter_name TEXT NOT NULL,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Core Metrics
    total_leads INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    evaluations_taken INTEGER NOT NULL DEFAULT 0,
    lost_leads INTEGER NOT NULL DEFAULT 0,
    
    -- Quality Assessment
    lead_quality_rating INTEGER NOT NULL DEFAULT 5 CHECK (lead_quality_rating >= 1 AND lead_quality_rating <= 10),
    
    -- Calculated Fields
    conversion_rate INTEGER NOT NULL DEFAULT 0,
    efficiency_score INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    -- Ensure one report per user per day
    CONSTRAINT unique_daily_report UNIQUE (profile_id, report_date)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_profile_id ON daily_reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_submitted_at ON daily_reports(submitted_at DESC);

-- Enable Row Level Security
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own daily reports" 
ON daily_reports FOR SELECT 
TO authenticated 
USING (user_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Policy: Users can insert their own reports
CREATE POLICY "Users can insert own daily reports" 
ON daily_reports FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own reports (only if not reviewed)
CREATE POLICY "Users can update own daily reports" 
ON daily_reports FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid() AND reviewed_at IS NULL)
WITH CHECK (user_id = auth.uid());

-- Policy: Only CEOs can delete reports
CREATE POLICY "Only CEOs can delete daily reports" 
ON daily_reports FOR DELETE 
TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Grant permissions
GRANT ALL ON daily_reports TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE daily_reports_id_seq TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE daily_reports IS 'Daily sales performance reports submitted by sales staff for CEO review';
