
CREATE OR REPLACE FUNCTION public.get_current_versions(p_fingerprints_users_id bigint)
RETURNS TABLE (max_version bigint)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Get the version from the fingerprints allocation table
    DECLARE
        allocation_version bigint;
        fingerprint_version bigint;
    BEGIN
        -- Get the maximum version from fingerprints_allocations
        SELECT COALESCE(MAX(fa.version), 0) INTO allocation_version
        FROM fingerprints_allocations fa
        WHERE fa.fingerprints_users_id = p_fingerprints_users_id;
        
        -- Get the version from the fingerprints table
        SELECT COALESCE(f.version, 0)::bigint INTO fingerprint_version
        FROM fingerprints f
        JOIN fingerprints_users fu ON f.fingerprint = fu.fingerprint_id
        WHERE fu.id = p_fingerprints_users_id;
        
        -- Return the greater of the two versions
        RETURN QUERY
        SELECT GREATEST(allocation_version, fingerprint_version) as max_version;
    END;
END;
$$;
