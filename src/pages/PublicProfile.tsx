import { useParams } from "react-router-dom";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { ProfileHero } from "@/components/ProfileHero";
import { AllocationsSection } from "@/components/AllocationsSection";
import { ActiveCampaignDisplay } from "@/components/ActiveCampaignDisplay";
import { EnhancedCampaignDisplay } from "@/components/campaigns/EnhancedCampaignDisplay";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { PaymentForm } from "@/components/PaymentForm";
import { PaymentHistory } from "@/components/PaymentHistory";
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

  const hidePaymentForm = user?.id === id;
  const firstName = profile.display_name.split(' ')[0];
  const displayStyle = profile.campaign_display_style || 'classic';

  if (displayStyle === 'enhanced') {
    return (
      <div className="min-h-screen bg-white">
        <EnhancedCampaignDisplay 
          userId={id || ''} 
          recipientName={profile.display_name}
          allocations={allocations}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ProfileHero profile={profile} userId={id || ''} />
      
      <div className="w-full py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ActiveCampaignDisplay userId={id || ''} />
        </div>
      </div>

      <div id="allocations">
        {allocations.length > 0 ? (
          <AllocationsSection allocations={allocations} firstName={firstName} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No allocations found for this profile.
          </div>
        )}
      </div>

      {!hidePaymentForm && (
        <div id="donate-section" className="w-full py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-primary mb-2">
                <HandHeart className="w-5 h-5" />
                <span className="font-medium">Make a better impact today</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Donate Today
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Your generous donation will directly support the charities and initiatives that matter most to {firstName}.
              </p>
            </div>
            
            <PaymentForm 
              recipientId={id || ''} 
              recipientName={profile.display_name}
            />
          </div>
        </div>
      )}

      <div id="payment-history" className="py-12">
        <PaymentHistory userId={id || ''} />
      </div>
    </div>
  );
};

export default PublicProfile;
