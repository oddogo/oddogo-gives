import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileForm } from "@/components/ProfileForm";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { Card } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
    } catch (error) {
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
