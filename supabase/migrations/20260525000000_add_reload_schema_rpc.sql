-- =====================================================
-- SYSTEM UTILITY: SCHEMA CACHE RELOAD
-- Allows executive users to force a PostgREST schema refresh
-- =====================================================

CREATE OR REPLACE FUNCTION reload_schema()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Signal PostgREST to reload schema
    NOTIFY pgrst, 'reload schema';
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION reload_schema() TO authenticated;
GRANT EXECUTE ON FUNCTION reload_schema() TO service_role;

COMMENT ON FUNCTION reload_schema() IS 'Triggers a PostgREST schema reload via NOTIFY pgrst, reload schema';
