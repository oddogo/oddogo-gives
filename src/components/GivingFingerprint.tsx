
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GivingFingerprintProps {
  userId: string;
}

export const GivingFingerprint = ({ userId }: GivingFingerprintProps) => {
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
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG
            value={`${window.location.origin}/profile/${userId}`}
            size={150}
            level="H"
            imageSettings={{
              src: "/lovable-uploads/b7702484-a438-4044-b5ef-cc6fbc31513f.png",
              height: 24,
              width: 24,
              excavate: true,
            }}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
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
