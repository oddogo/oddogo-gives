
import { useParams } from "react-router-dom";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { ProfileHeader } from "@/components/ProfileHeader";
import { AllocationsSection } from "@/components/AllocationsSection";
import { ActiveCampaign } from "@/components/ActiveCampaign";

const PublicProfile = () => {
  const { id } = useParams();
  const { profile, allocations, loading } = usePublicProfile(id);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Loading...</div>
    </div>
  );
  
  if (!profile) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-600">Profile not found or not public</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader profile={profile} userId={id || ''} />

        {allocations.length > 0 ? (
          <AllocationsSection allocations={allocations} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No allocations found for this profile.
          </div>
        )}

        <ActiveCampaign />
      </div>
    </div>
  );
};

export default PublicProfile;
