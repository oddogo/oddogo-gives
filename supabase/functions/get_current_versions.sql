
CREATE OR REPLACE FUNCTION public.get_current_versions(p_fingerprints_users_id bigint)
RETURNS TABLE (max_version bigint)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT GREATEST(
        COALESCE(MAX(fa.version), 0),
        COALESCE((
            SELECT f.version::bigint
            FROM fingerprints f
            JOIN fingerprints_users fu ON f.fingerprint = fu.fingerprint_id
            WHERE fu.id = p_fingerprints_users_id
        ), 0)
    ) as max_version
    FROM fingerprints_allocations fa
    WHERE fa.fingerprints_users_id = p_fingerprints_users_id;
END;
$$;
