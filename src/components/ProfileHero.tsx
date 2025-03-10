
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
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <img 
            src="/lovable-uploads/f93632f8-5b63-4b87-9ba6-55d1bbb04d8a.png"
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

          <h1 className="text-4xl font-bold mb-4 text-white">{profile.display_name}</h1>
          <p className="text-lg text-gray-200 max-w-2xl mb-12 leading-relaxed">
            {profile.bio}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
              <Trophy size={16} />
              <span>Silver Supporter</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
              <Trophy size={16} />
              <span>Rank #24</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
              <Coins size={16} />
              <span>18 Donations</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
              <Flag size={16} />
              <span>3 Successful Campaigns</span>
            </div>
          </div>

          <button className="bg-teal-500 hover:bg-teal-600 transition-colors text-white px-6 py-2.5 rounded-full flex items-center gap-2 text-sm">
            <img 
              src="/lovable-uploads/16dff745-56b1-4162-b2c6-2f3ca2eb1b09.png" 
              alt="Fingerprint" 
              className="w-4 h-4 brightness-0 invert"
            />
            <span>Giving Fingerprint</span>
          </button>
        </div>
      </div>
    </div>
  );
};
