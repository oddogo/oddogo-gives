
import { useEffect, useState } from "react";
import { Avatar as AvatarUI, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AvatarProps {
  uid: string;
  url?: string;
  onUpload?: (url: string) => void;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
}

export const Avatar = ({ uid, url, onUpload, size = "md", editable = false }: AvatarProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  const downloadImage = async (path: string) => {
    try {
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(path.replace(`${supabase.storageUrl}/object/public/avatars/`, ''));

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error downloading image: ', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${uid}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
      setAvatarUrl(data.publicUrl);
      if (onUpload) onUpload(filePath); // Store the path, not the full URL
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-20 w-20",
    lg: "h-32 w-32"
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <AvatarUI className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>{uid.slice(0, 2).toUpperCase()}</AvatarFallback>
      </AvatarUI>
      {editable && (
        <div>
          <Button variant="outline" size="sm" className="relative" disabled={uploading}>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Update Photo"}
          </Button>
        </div>
      )}
    </div>
  );
};
