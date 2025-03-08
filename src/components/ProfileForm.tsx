import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Avatar } from "@/components/Avatar";

interface ProfileFormProps {
  onSuccess?: () => void;
}

export const ProfileForm = ({ onSuccess }: ProfileFormProps) => {
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    causes_description: "",
    is_published: false,
    avatar_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          display_name: data.display_name || "",
          bio: data.bio || "",
          causes_description: data.causes_description || "",
          is_published: data.is_published || false,
          avatar_url: data.avatar_url || ""
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          avatar_url: profile.avatar_url
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (url: string) => {
    setProfile(prev => ({ ...prev, avatar_url: url }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center mb-8">
        <Avatar 
          uid={userId || ''} 
          url={profile.avatar_url}
          onUpload={handleAvatarUpload}
          size="lg"
          editable
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Display Name</label>
        <Input
          value={profile.display_name || ""}
          onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
          placeholder="Your display name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Bio</label>
        <textarea
          value={profile.bio || ""}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Tell us about yourself"
          className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Important Causes</label>
        <textarea
          value={profile.causes_description || ""}
          onChange={(e) => setProfile({ ...profile, causes_description: e.target.value })}
          placeholder="Describe the causes that matter to you"
          className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={profile.is_published}
            onCheckedChange={(checked) => setProfile({ ...profile, is_published: checked })}
            id="publish"
          />
          <label htmlFor="publish" className="text-sm text-white">
            Make profile public
          </label>
        </div>

        {profile.is_published && userId && (
          <div className="bg-white p-4 rounded-lg w-fit">
            <QRCodeSVG
              value={`${window.location.origin}/profile/${userId}`}
              size={150}
              level="H"
              imageSettings={{
                src: "/lovable-uploads/b7702484-a438-4044-b5ef-cc6fbc31513f.png",
                height: 24,
                width: 24,
                excavate: true,
                x: undefined,
                y: undefined,
              }}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
};
