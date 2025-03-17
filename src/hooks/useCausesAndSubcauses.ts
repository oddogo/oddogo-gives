
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CauseWithSubcauses {
  cause_id: number;
  cause_name: string;
  cause_description: string;
  cause_img: string | null;
  subcause_id: number;
  subcause_name: string;
  subcause_description: string;
  subcause_img: string | null;
}

export const useCausesAndSubcauses = () => {
  const { data: causesData, isLoading } = useQuery({
    queryKey: ['causes-subcauses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_active_causes_with_subcauses')
        .select('*');
      
      if (error) throw error;
      
      // Group subcauses by cause
      const causesMap = new Map();
      data?.forEach((item: CauseWithSubcauses) => {
        if (!causesMap.has(item.cause_id)) {
          causesMap.set(item.cause_id, {
            id: item.cause_id,
            name: item.cause_name,
            description: item.cause_description,
            img: item.cause_img,
            subcauses: []
          });
        }
        
        if (item.subcause_id) {
          causesMap.get(item.cause_id).subcauses.push({
            id: item.subcause_id,
            name: item.subcause_name,
            description: item.subcause_description,
            img: item.subcause_img
          });
        }
      });
      
      return Array.from(causesMap.values());
    }
  });

  return { causes: causesData || [], isLoading };
};
