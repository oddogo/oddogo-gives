
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AllocationFormProps {
  onSuccess?: () => void;
}

export const FingerPrintAllocationForm = ({ onSuccess }: AllocationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [allocation, setAllocation] = useState({
    name: "",
    percentage: 0,
    type: "charity"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First create a new fingerprint
      const { data: fingerprint, error: fingerprintError } = await supabase
        .from('fingerprints')
        .insert([{
          fingerprint: crypto.randomUUID(), // Add the required fingerprint field
          name: allocation.name,
          version: 1
        }])
        .select()
        .single();

      if (fingerprintError) throw fingerprintError;

      // Then create the user association
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error("No user found");

      const { error: userError } = await supabase
        .from('fingerprints_users')
        .insert([
          { 
            fingerprint_id: fingerprint.fingerprint,
            user_id: user.user.id
          }
        ]);

      if (userError) throw userError;

      toast.success("Allocation created successfully!");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Name
        </label>
        <Input
          required
          value={allocation.name}
          onChange={(e) => setAllocation({ ...allocation, name: e.target.value })}
          placeholder="Allocation name"
          className="bg-white/5 border-white/10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Percentage
        </label>
        <Input
          required
          type="number"
          min={0}
          max={100}
          value={allocation.percentage}
          onChange={(e) => setAllocation({ ...allocation, percentage: Number(e.target.value) })}
          placeholder="Allocation percentage"
          className="bg-white/5 border-white/10"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Allocation"}
      </Button>
    </form>
  );
};
