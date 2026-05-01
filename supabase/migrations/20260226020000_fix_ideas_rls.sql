-- Add missing DELETE and UPDATE policies for ideas table
DROP POLICY IF EXISTS "CEOs can manage all ideas" ON ideas;
CREATE POLICY "CEOs can manage all ideas" ON ideas FOR ALL
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
)
WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
);
