
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FingerPrintAllocationForm } from "./FingerPrintAllocationForm";

interface Fingerprint {
  fingerprint: string;
  name: string;
  created_at: string;
}

export const FingerPrintList = () => {
  const [fingerprints, setFingerprints] = useState<Fingerprint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFingerprints = async () => {
    try {
      const { data, error } = await supabase
        .from('fingerprints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFingerprints(data || []);
    } catch (error: any) {
      console.error('Error loading fingerprints:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFingerprints();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
        <h2 className="text-xl font-bold mb-4">Create New Allocation</h2>
        <FingerPrintAllocationForm onSuccess={loadFingerprints} />
      </Card>

      <div className="grid gap-4">
        {fingerprints.map((fingerprint) => (
          <Card 
            key={fingerprint.fingerprint}
            className="p-4 bg-white/5 backdrop-blur-xl border-white/10"
          >
            <h3 className="font-medium">{fingerprint.name}</h3>
            <p className="text-sm text-gray-400">
              Created: {new Date(fingerprint.created_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
