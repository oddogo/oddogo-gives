
import { useParams } from "react-router-dom";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { ProfileHero } from "@/components/ProfileHero";
import { AllocationsSection } from "@/components/AllocationsSection";
import { ActiveCampaign } from "@/components/ActiveCampaign";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { PaymentForm } from "@/components/PaymentForm";
import { HandHeart } from "lucide-react";

const PublicProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
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

  // Show payment form only if:
  // 1. User is logged in
  // 2. Viewing someone else's profile
  const showPaymentForm = user && user.id !== id;

  return (
    <div className="min-h-screen bg-white">
      <ProfileHero profile={profile} userId={id || ''} />

      {allocations.length > 0 ? (
        <AllocationsSection allocations={allocations} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No allocations found for this profile.
        </div>
      )}

      {showPaymentForm && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-primary mb-2">
              <HandHeart className="w-5 h-5" />
              <span className="font-medium">Make a Difference</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Support {profile.display_name}'s Causes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Your donation will help fund the causes and charities that {profile.display_name} supports
            </p>
          </div>
          <PaymentForm 
            recipientId={id || ''} 
            recipientName={profile.display_name}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ActiveCampaign />
      </div>
    </div>
  );
};

export default PublicProfile;
