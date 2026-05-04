-- Create financial_entries table for daily financial data
CREATE TABLE IF NOT EXISTS financial_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    uloomx_income DECIMAL(12,2) DEFAULT 0,
    usthad_income DECIMAL(12,2) DEFAULT 0,
    total_expenses DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) GENERATED ALWAYS AS (uloomx_income + usthad_income - total_expenses) STORED,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by UUID REFERENCES profiles(id),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for financial_entries
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own financial entries" ON financial_entries;
DROP POLICY IF EXISTS "CEO can view all financial entries" ON financial_entries;
DROP POLICY IF EXISTS "Users can insert own financial entries" ON financial_entries;
DROP POLICY IF EXISTS "CEO can update financial entries" ON financial_entries;

-- Policy: Users can view their own financial entries, CEO can view all
CREATE POLICY "Users can view own financial entries" ON financial_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "CEO can view all financial entries" ON financial_entries FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Policy: Users can insert their own financial entries
CREATE POLICY "Users can insert own financial entries" ON financial_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: CEO can update all financial entries
CREATE POLICY "CEO can update financial entries" ON financial_entries FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_financial_entries_date ON financial_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_entries_user ON financial_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_status ON financial_entries(status);

-- Add comments for documentation
COMMENT ON TABLE financial_entries IS 'Daily financial entries submitted by accounts staff';
COMMENT ON COLUMN financial_entries.uloomx_income IS 'Income from UloomX platform';
COMMENT ON COLUMN financial_entries.usthad_income IS 'Income from Usthad Academy';
COMMENT ON COLUMN financial_entries.total_expenses IS 'Total combined expenses';
COMMENT ON COLUMN financial_entries.revenue IS 'Calculated revenue (income - expenses)';
