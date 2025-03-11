
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Allocation } from "@/types/allocation";
import { toast } from "sonner";

interface UseFingerprint {
  loading: boolean;
  error: string | null;
  saveFingerprint: (allocations: Allocation[]) => Promise<void>;
}

export const useFingerprint = (onSuccess?: () => void): UseFingerprint => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFingerprintsUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('fingerprints_users')
      .select('id, fingerprint_id')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  };

  const saveFingerprint = async (allocations: Allocation[]) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      console.log('Starting save process for user:', user.id);

      let fingerprintsUsers = await getFingerprintsUser(user.id);
      
      if (!fingerprintsUsers) {
        const { data: fingerprintId, error: initError } = await supabase
          .rpc('initialize_user_fingerprint', {
            p_user_id: user.id
          });

        if (initError) throw initError;

        const { data: newFingerprintsUsers, error: fetchError } = await supabase
          .from('fingerprints_users')
          .select('id, fingerprint_id')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;
        fingerprintsUsers = newFingerprintsUsers;
      }

      const { data: currentFingerprint, error: fingerprintError } = await supabase
        .from('fingerprints')
        .select('version')
        .eq('fingerprint', fingerprintsUsers.fingerprint_id)
        .single();

      if (fingerprintError) throw fingerprintError;

      const currentVersion = currentFingerprint?.version || 0;
      const nextVersion = Number(currentVersion) + 1;
      
      const { error: deleteError } = await supabase
        .rpc('mark_fingerprint_allocations_as_deleted', {
          p_fingerprints_users_id: fingerprintsUsers.id
        });

      if (deleteError) throw deleteError;

      const allocationsToInsert = allocations.map(a => ({
        fingerprints_users_id: fingerprintsUsers.id,
        allocation_percentage: a.allocation_percentage,
        allocation_charity_id: a.allocation_type === 'Charity' ? a.id : null,
        allocation_subcause_id: a.allocation_type === 'Subcause' ? Number(a.id) : null,
        allocation_region_id: a.allocation_type === 'Region' ? Number(a.id) : null,
        allocation_meta_id: a.allocation_type === 'Meta' ? Number(a.id) : null,
        allocation_daf: a.allocation_type === 'DAF',
        allocation_spotlight: a.allocation_type === 'Spotlight',
        version: nextVersion
      }));

      const { error: insertError } = await supabase
        .from('fingerprints_allocations')
        .insert(allocationsToInsert);

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('fingerprints')
        .update({ 
          version: nextVersion,
          updated_at: new Date().toISOString()
        })
        .eq('fingerprint', fingerprintsUsers.fingerprint_id);

      if (updateError) throw updateError;

      toast.success("Fingerprint updated successfully!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveFingerprint
  };
};
