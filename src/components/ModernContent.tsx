import { User } from "@supabase/supabase-js";
import { Allocation } from "@/types/allocation";
import { DashboardChart } from "./DashboardChart";
import { AllocationTable } from "./AllocationTable";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Search, Download, SlidersHorizontal, PencilLine } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { EditFingerprintModal } from "./EditFingerprintModal";
import { supabase } from "@/integrations/supabase/client";

interface ModernContentProps {
  user: User | null;
  allocations: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
  onRefresh: () => void;
}

export const ModernContent = ({ 
  user,
  allocations,
  hoveredIndex,
  onHoverChange,
  onRefresh
}: ModernContentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [version, setVersion] = useState<number>(1);
  
  useEffect(() => {
    if (user) {
      fetchFingerprintVersion();
    }
  }, [user, refreshKey]);

  const fetchFingerprintVersion = async () => {
    try {
      // Get the user's fingerprint_id first
      const { data: fingerprintData } = await supabase
        .from('fingerprints_users')
        .select('fingerprint_id')
        .eq('user_id', user?.id)
        .is('deleted_at', null)
        .single();

      if (fingerprintData) {
        // Then get the version from fingerprints table
        const { data: versionData } = await supabase
          .from('fingerprints')
          .select('version')
          .eq('fingerprint', fingerprintData.fingerprint_id)
          .single();

        if (versionData) {
          setVersion(Number(versionData.version));
        }
      }
    } catch (error) {
      console.error('Error fetching fingerprint version:', error);
    }
  };
  
  // Filter out deleted allocations and calculate total
  const activeAllocations = allocations.filter(a => !a.deleted_at);
  const totalAllocation = activeAllocations.reduce((sum, a) => sum + a.allocation_percentage, 0);
  const uniqueTypes = new Set(activeAllocations.map(a => a.allocation_type)).size;
  
  // Filter active allocations based on search query
  const filteredAllocations = activeAllocations.filter(allocation => 
    allocation.allocation_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    allocation.allocation_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    onRefresh();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-purple-500/10 backdrop-blur-sm border-purple-500/20 p-4">
          <h3 className="text-sm font-medium text-purple-200">Total Allocation</h3>
          <p className="text-2xl font-bold text-white">{(totalAllocation * 100).toFixed(0)}%</p>
        </Card>
        
        <Card className="bg-blue-500/10 backdrop-blur-sm border-blue-500/20 p-4">
          <h3 className="text-sm font-medium text-blue-200">Allocation Types</h3>
          <p className="text-2xl font-bold text-white">{uniqueTypes}</p>
        </Card>
        
        <Card className="bg-teal-500/10 backdrop-blur-sm border-teal-500/20 p-4">
          <h3 className="text-sm font-medium text-teal-200">Total Causes</h3>
          <p className="text-2xl font-bold text-white">{allocations.length}</p>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-2xl font-semibold">Charitable Fingerprint™</h2>
              <p className="text-sm text-gray-400 mt-1">
                You have updated your fingerprint {version} {version === 1 ? 'time' : 'times'}!
              </p>
            </div>
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="gap-2"
            >
              <PencilLine className="h-4 w-4" />
              Update My Fingerprint
            </Button>
          </div>
          
          {/* Filter Bar */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search allocations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>
            <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Chart and Table Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="w-full bg-white/5 rounded-lg backdrop-blur-sm p-4 border border-white/10">
              <DashboardChart 
                data={filteredAllocations} 
                hoveredIndex={hoveredIndex}
                onHoverChange={onHoverChange}
              />
            </div>
            <div className="w-full">
              <AllocationTable 
                data={filteredAllocations} 
                hoveredIndex={hoveredIndex}
                onHoverChange={onHoverChange}
              />
            </div>
          </div>
        </div>
      </Card>

      <EditFingerprintModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        allocations={allocations}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};
