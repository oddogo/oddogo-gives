
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, User as UserIcon } from "lucide-react";

interface UserInfoProps {
  user: User;
}

export const UserInfo = ({ user }: UserInfoProps) => {
  const provider = user.app_metadata.provider || 'email';
  const avatarUrl = user.user_metadata.avatar_url;
  const name = user.user_metadata.full_name || user.email?.split('@')[0];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-none">
      <CardContent className="flex items-center space-x-4 p-4">
        <Avatar className="h-12 w-12">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name} />
          ) : (
            <AvatarFallback className="bg-teal-600 text-white">
              {name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-white">{name}</h3>
          <div className="flex items-center text-sm text-white/80 space-x-4">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {user.email}
            </div>
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              via {provider}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
