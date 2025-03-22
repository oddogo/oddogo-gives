
import { Logo } from "@/components/Logo";
import { MapPin, Trophy, Coins, Flag } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type { Profile } from "@/hooks/usePublicProfile";

interface ProfileHeaderProps {
  profile: Profile;
  userId: string;
}

export const ProfileHeader = ({ profile, userId }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col items-center mb-12 text-center">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="mb-4">
        <Avatar uid={userId} size="lg" url={profile?.avatar_url} />
      </div>
      <div className="inline-flex bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm items-center gap-2 mb-4">
        <MapPin className="w-4 h-4" />
        <span>{profile.location || "London, UK"}</span>
      </div>
      <h1 className="text-2xl font-semibold mb-4 text-black">{profile.display_name}</h1>
      <p className="text-gray-600 max-w-2xl mb-12 px-4 sm:px-6 text-lg leading-relaxed">
        {profile.bio}
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
        <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
          <Trophy size={14} />
          <span>Silver Supporter</span>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
          <Trophy size={14} />
          <span>Rank #24</span>
        </div>
        <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
          <Coins size={14} />
          <span>18 Donations</span>
        </div>
        <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
          <Flag size={14} />
          <span>3 Successful Campaigns</span>
        </div>
      </div>

      <button className="bg-[#008080] text-white px-5 py-2 rounded-full flex items-center gap-2 text-sm">
        <img 
          src="/lovable-uploads/16dff745-56b1-4162-b2c6-2f3ca2eb1b09.png" 
          alt="Fingerprint" 
          className="w-4 h-4 brightness-0 invert"
        />
        <span>Giving Fingerprint</span>
      </button>
    </div>
  );
};
