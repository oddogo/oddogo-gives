
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
      // Query the actual available tables instead of using the view
      const { data: causesData, error: causesError } = await supabase
        .from('charities_charity_causes')
        .select('id, cause_name, description, img');
      
      if (causesError) throw causesError;
      
      const { data: subcausesData, error: subcausesError } = await supabase
        .from('charities_charity_sub_causes')
        .select('id, cause_id, subcause_name, description, img');
      
      if (subcausesError) throw subcausesError;
      
      // Group subcauses by cause
      const causesMap = new Map();
      
      // First, add all causes
      causesData.forEach((cause) => {
        causesMap.set(cause.id, {
          id: cause.id,
          name: cause.cause_name,
          description: cause.description,
          img: cause.img,
          subcauses: []
        });
      });
      
      // Then add subcauses to their respective causes
      subcausesData.forEach((subcause) => {
        const cause = causesMap.get(subcause.cause_id);
        if (cause) {
          cause.subcauses.push({
            id: subcause.id,
            name: subcause.subcause_name,
            description: subcause.description,
            img: subcause.img
          });
        }
      });
      
      return Array.from(causesMap.values());
    }
  });

  return { causes: causesData || [], isLoading };
};
