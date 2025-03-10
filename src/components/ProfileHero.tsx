import { Profile } from "@/hooks/usePublicProfile";
import { Avatar } from "@/components/Avatar";
import { MapPin, Trophy, Coins, Flag } from "lucide-react";

interface ProfileHeroProps {
  profile: Profile;
  userId: string;
}

export const ProfileHero = ({ profile, userId }: ProfileHeroProps) => {
  return (
    <div className="relative w-full bg-gradient-to-b from-teal-950 to-teal-900 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <img 
            src="/lovable-uploads/84d2bfc5-f954-419b-bc27-5208fd6f2676.png"
            alt="Oddogo Logo"
            className="h-16 md:h-20 mb-12"
          />
          
          <div className="mb-6">
            <Avatar uid={userId} size="lg" url={profile?.avatar_url} />
          </div>

          <div className="inline-flex bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm items-center gap-2 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{profile.location || "London, UK"}</span>
          </div>

          <h1 className="text-4xl font-bold mb-8 text-white">
            {profile.display_name}
          </h1>

          <div className="flex flex-col md:flex-row gap-8 max-w-4xl mb-12">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white/90 mb-2">About</h3>
              <p className={`text-white/80 leading-relaxed ${profile.bio?.length > 100 ? 'text-justify' : 'text-center'}`}>
                {profile.bio || "No bio provided"}
              </p>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white/90 mb-2">Important Causes</h3>
              <p className={`text-white/80 leading-relaxed ${profile.causes_description?.length > 100 ? 'text-justify' : 'text-center'}`}>
                {profile.causes_description || "No causes specified"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="bg-amber-500/20 text-amber-200 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
              <Trophy size={16} />
              <span>Silver Supporter</span>
            </div>
            <div className="bg-purple-500/20 text-purple-200 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
              <Trophy size={16} />
              <span>Rank #24</span>
            </div>
            <div className="bg-emerald-500/20 text-emerald-200 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
              <Coins size={16} />
              <span>18 Donations</span>
            </div>
            <div className="bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
              <Flag size={16} />
              <span>3 Successful Campaigns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
