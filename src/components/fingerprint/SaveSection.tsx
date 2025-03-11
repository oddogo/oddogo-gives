
import { Button } from "@/components/ui/button";

interface SaveSectionProps {
  totalPercentage: number;
  error: string | null;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const SaveSection = ({
  totalPercentage,
  error,
  loading,
  onSave,
  onCancel
}: SaveSectionProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-white/60">
        Total: {totalPercentage.toFixed(1)}%
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="border-white/10">
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          disabled={loading || !!error}
          className={error ? "opacity-50 cursor-not-allowed" : ""}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
