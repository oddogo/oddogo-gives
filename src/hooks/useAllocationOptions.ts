
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AllocationOption {
  id: string;
  name: string;
  type: 'Charity' | 'Subcause' | 'Meta' | 'Region';
}

export const useAllocationOptions = () => {
  const fetchPartnerCharities = async () => {
    const { data, error } = await supabase
      .from('charities_charity_partners')
      .select(`
        charity_id,
        charities:charity_id (
          charity_name,
          website
        )
      `)
      .is('end_date', null);
    
    if (error) throw error;
    return data.map(item => ({
      id: item.charity_id,
      name: item.charities.charity_name,
      type: 'Charity' as const,
      website: item.charities.website
    }));
  };

  const fetchSubcauses = async () => {
    const { data, error } = await supabase
      .from('charities_charity_sub_causes')
      .select('id, subcause_name')
      .is('deleted_at', null);
    
    if (error) throw error;
    return data.map(item => ({
      id: item.id.toString(),
      name: item.subcause_name,
      type: 'Subcause' as const
    }));
  };

  const fetchRegions = async () => {
    const { data, error } = await supabase
      .from('charities_charity_regions')
      .select('id, region_name')
      .is('deleted_at', null);
    
    if (error) throw error;
    return data.map(item => ({
      id: item.id.toString(),
      name: item.region_name,
      type: 'Region' as const
    }));
  };

  const fetchMetadata = async () => {
    const { data, error } = await supabase
      .from('charities_charity_metadata')
      .select('id, meta_name')
      .is('deleted_at', null);
    
    if (error) throw error;
    return data.map(item => ({
      id: item.id.toString(),
      name: item.meta_name,
      type: 'Meta' as const
    }));
  };

  const { data: charities, isLoading: loadingCharities } = useQuery({
    queryKey: ['partner-charities'],
    queryFn: fetchPartnerCharities
  });

  const { data: subcauses, isLoading: loadingSubcauses } = useQuery({
    queryKey: ['subcauses'],
    queryFn: fetchSubcauses
  });

  const { data: regions, isLoading: loadingRegions } = useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegions
  });

  const { data: metadata, isLoading: loadingMetadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: fetchMetadata
  });

  const isLoading = loadingCharities || loadingSubcauses || loadingRegions || loadingMetadata;

  return {
    options: {
      charities: charities || [],
      subcauses: subcauses || [],
      regions: regions || [],
      metadata: metadata || []
    },
    isLoading
  };
};
