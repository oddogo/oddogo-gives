import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Allocation, AllocationType } from "@/types/allocation";

export interface Profile {
  id: string;
  display_name: string;
  bio: string;
  location?: string;
  avatar_url?: string;
}

export function usePublicProfile(id: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadPublicProfile();
  }, [id]);

  const isValidAllocationType = (type: string): type is AllocationType => {
    return ['Charity', 'Subcause', 'Meta', 'Region', 'DAF', 'Spotlight', 'None - Error'].includes(type);
  };

  const loadPublicProfile = async () => {
    try {
      if (!id) return;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: allocationsData, error: allocationsError } = await supabase
        .from('v_fingerprints_live')
        .select(`
          *,
          charities:allocation_charity_id (
            website
          )
        `)
        .eq('user_id', id)
        .is('deleted_at', null);

      if (allocationsError) throw allocationsError;
      
      if (allocationsData) {
        const formattedAllocations: Allocation[] = allocationsData.map(item => {
          const allocationType = isValidAllocationType(item.allocation_type) 
            ? item.allocation_type 
            : 'None - Error';

          return {
            id: Number(item.id),
            allocation_name: item.allocation_name || 'Unknown',
            allocation_type: allocationType,
            allocation_percentage: Number(item.allocation_percentage),
            cause_name: item.allocation_name || 'Unknown',
            website_favicon: item.charities?.website || null
          };
        });
        setAllocations(formattedAllocations);
      }
    } catch (error) {
      console.error('Error loading public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return { profile, allocations, loading };
}
