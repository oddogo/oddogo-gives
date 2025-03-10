
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail } from "lucide-react";

interface ModernHeaderProps {
  user: User | null;
}

export const ModernHeader = ({ user }: ModernHeaderProps) => {
  if (!user) return null;

  const provider = user.app_metadata.provider || 'email';
  const avatarUrl = user.user_metadata.avatar_url;
  const name = user.user_metadata.full_name || user.email?.split('@')[0];

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Welcome back, <span className="text-purple-400">{name}</span>
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-white/60">
            <Mail className="h-4 w-4 mr-1" />
            via {provider}
          </div>
          
          <Avatar className="h-8 w-8">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={name} />
            ) : (
              <AvatarFallback className="bg-purple-600 text-white">
                {name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
    </header>
  );
};
