
import { toast } from "sonner";
import { Copy, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ShareProfileProps {
  userId: string;
}

export const ShareProfile = ({ userId }: ShareProfileProps) => {
  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy profile link");
    }
  };

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-black/10 p-4">
          <Fingerprint className="w-12 h-12 text-primary" />
        </div>
        <Button 
          onClick={handleShare} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Profile Link
        </Button>
      </div>
    </Card>
  );
};
