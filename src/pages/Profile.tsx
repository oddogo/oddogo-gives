import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileForm } from "@/components/ProfileForm";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { Card } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { DebugFooter } from "@/components/DebugFooter";
import { PaymentForm } from "@/components/PaymentForm";
import { HandHeart } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        toast.error("Error fetching profile");
        console.error("Profile error:", profileError);
        return;
      }

      // If no profile exists, create one
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id }]);

        if (insertError) {
          toast.error("Error creating profile");
          console.error("Insert error:", insertError);
          return;
        }
      }

      setUser(user);
    } catch (error: any) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1F3C] text-white">
      <div className="flex">
        <DashboardSidebar user={user} onSignOut={handleSignOut} />
        <div className="flex-1">
          <ModernHeader user={user} />
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6">
              <ProfileForm />
            </Card>

            {/* Payment History Section */}
            <div className="mt-12">
              <div className="bg-white/5 backdrop-blur-xl rounded-lg p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Your Donations</h2>
                  <p className="text-gray-300">
                    Track your giving history and impact
                  </p>
                </div>

                {user && (
                  <PaymentHistory 
                    userId={user.id}
                  />
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="mt-12">
              <div className="bg-white/5 backdrop-blur-xl rounded-lg p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Preview Your Donation Page</h2>
                  <p className="text-gray-300">
                    This is how your donation page appears to others. Share your profile link or QR code to receive donations.
                  </p>
                </div>

                {profile && (
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 text-primary mb-2">
                        <HandHeart className="w-5 h-5" />
                        <span className="font-medium">Support {profile.display_name || 'this user'}'s Causes</span>
                      </div>
                      <p className="mt-4 text-lg text-gray-300">
                        Your donation will help fund the causes and charities that matter
                      </p>
                    </div>
                    
                    {user && (
                      <PaymentForm 
                        recipientId={user.id}
                        recipientName={profile.display_name || 'this user'}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DebugFooter user={user} />
    </div>
  );
};

export default Profile;
