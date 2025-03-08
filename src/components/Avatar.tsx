
import { useEffect, useState } from "react";
import { Avatar as AvatarUI, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Fingerprint } from "lucide-react";
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
      // Get public URL for the avatar
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      if (data?.publicUrl) {
        // Add cache-busting query parameter
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${data.publicUrl}?t=${timestamp}`;
        setAvatarUrl(urlWithTimestamp);
      }
    } catch (error) {
      console.error('Error downloading image: ', error);
      setAvatarUrl(null);
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
      // Create a unique file path including user ID
      const filePath = `${uid}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: '0',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL after successful upload
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      
      if (data?.publicUrl) {
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${data.publicUrl}?t=${timestamp}`;
        setAvatarUrl(urlWithTimestamp);
        if (onUpload) onUpload(filePath);
      }
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

  const getFallbackInitials = () => {
    return uid.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <AvatarUI className={sizeClasses[size]}>
          {avatarUrl ? (
            <AvatarImage 
              src={avatarUrl} 
              alt="Profile" 
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-muted">
              {getFallbackInitials()}
            </AvatarFallback>
          )}
        </AvatarUI>
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md">
          <Fingerprint className="w-5 h-5 text-[#40B8B8]" />
        </div>
      </div>
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
