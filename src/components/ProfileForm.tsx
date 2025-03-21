
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Avatar } from "@/components/Avatar";
import { ShareProfile } from "@/components/ShareProfile";

interface ProfileFormProps {
  onSuccess?: () => void;
}

export const ProfileForm = ({ onSuccess }: ProfileFormProps) => {
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    causes_description: "",
    is_published: false,
    avatar_url: "",
    campaign_display_style: "classic"
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user); // Debug log
      
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log("Profile data:", data); // Debug log
      console.log("Profile error:", error); // Debug log

      if (error) throw error;
      if (data) {
        setProfile({
          display_name: data.display_name || "",
          bio: data.bio || "",
          causes_description: data.causes_description || "",
          is_published: data.is_published || false,
          avatar_url: data.avatar_url || "",
          campaign_display_style: data.campaign_display_style || "classic"
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error); // Debug log
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting profile update:", profile); // Debug log

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          causes_description: profile.causes_description,
          is_published: profile.is_published,
          avatar_url: profile.avatar_url,
          campaign_display_style: profile.campaign_display_style
        })
        .eq('id', user.id);

      console.log("Update error:", error); // Debug log

      if (error) throw error;
      toast.success("Profile saved successfully!", {
        duration: 4000,
        style: {
          background: 'var(--primary)',
          color: 'white',
        },
      });
    } catch (error: any) {
      console.error("Error updating profile:", error); // Debug log
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (url: string) => {
    console.log("New avatar URL:", url); // Debug log
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
          <ShareProfile userId={userId} />
        )}
      </div>

      <div className="border-t border-gray-700 pt-6 mt-6">
        <h3 className="text-lg font-medium text-white mb-4">Campaign Display Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="display-classic"
                name="campaign_display_style"
                type="radio"
                checked={profile.campaign_display_style === "classic"}
                onChange={() => setProfile({ ...profile, campaign_display_style: "classic" })}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="display-classic" className="font-medium text-white">Classic Display</label>
              <p className="text-gray-400">Simple layout for displaying your active campaigns</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="display-enhanced"
                name="campaign_display_style"
                type="radio"
                checked={profile.campaign_display_style === "enhanced"}
                onChange={() => setProfile({ ...profile, campaign_display_style: "enhanced" })}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="display-enhanced" className="font-medium text-white">Enhanced Display</label>
              <p className="text-gray-400">JustGiving-style campaign display with hero image and progress visualization</p>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
};
