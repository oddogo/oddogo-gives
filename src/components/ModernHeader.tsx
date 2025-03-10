
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail } from "lucide-react";

interface ModernHeaderProps {
  user: User | null;
}

const capitalizeWords = (str: string) => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export const ModernHeader = ({ user }: ModernHeaderProps) => {
  if (!user) return null;

  const provider = user.app_metadata.provider || 'email';
  const avatarUrl = user.user_metadata.avatar_url;
  const name = capitalizeWords(user.user_metadata.full_name || user.email?.split('@')[0] || '');

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-[#40B8B8]/20">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={name} />
            ) : (
              <AvatarFallback className="bg-[#40B8B8]/10 text-[#40B8B8]">
                {name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <h1 className="text-xl font-semibold">
            Welcome back, <span className="text-[#40B8B8]">{name}</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-white/60">
            <Mail className="h-4 w-4 mr-1" />
            via {provider}
          </div>
        </div>
      </div>
    </header>
  );
};
