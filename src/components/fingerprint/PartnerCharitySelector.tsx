
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Allocation } from "@/types/allocation";

interface PartnerCharity {
  charity_id: string;
  charity_name: string;
  registered_number: string;
  website?: string;
}

interface PartnerCharitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (allocation: Allocation) => void;
}

const toSentenceCase = (str: string) => {
  return str.toLowerCase().replace(/(^\w|\.\s+\w)/g, letter => letter.toUpperCase());
};

export const PartnerCharitySelector = ({
  isOpen,
  onClose,
  onSelect,
}: PartnerCharitySelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: charities, isLoading } = useQuery({
    queryKey: ['partner-charities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charities_charity_partners')
        .select('*, charities:charity_id (website, charity_name, registered_number)');
      
      if (error) throw error;
      
      // Transform the data structure to match what we need
      const formattedData = data.map(item => ({
        charity_id: item.charity_id,
        charity_name: toSentenceCase(item.charities?.charity_name || ''),
        registered_number: item.charities?.registered_number || '',
        website: item.charities?.website || null
      }));
      
      // Sort charities alphabetically
      return formattedData.sort((a, b) => 
        a.charity_name.localeCompare(b.charity_name)
      );
    }
  });

  const filteredCharities = charities?.filter(charity =>
    charity.charity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    charity.registered_number?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelect = (charity: PartnerCharity) => {
    onSelect({
      id: charity.charity_id,
      allocation_name: charity.charity_name,
      allocation_type: 'Charity',
      allocation_percentage: 0,
      website_favicon: charity.website || null
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1A1F2C] text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Select Partner Charity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search charities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          
          <div className="grid gap-2 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <p className="text-center py-4">Loading charities...</p>
            ) : filteredCharities.length > 0 ? (
              filteredCharities.map((charity) => (
                <Button
                  key={charity.charity_id}
                  variant="outline"
                  className="w-full justify-start text-left border-white/10 hover:bg-white/10"
                  onClick={() => handleSelect(charity)}
                >
                  <div>
                    <div className="font-medium">{charity.charity_name}</div>
                    {charity.registered_number && (
                      <div className="text-sm text-gray-400">#{charity.registered_number}</div>
                    )}
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-center py-4 text-gray-400">No charities found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
