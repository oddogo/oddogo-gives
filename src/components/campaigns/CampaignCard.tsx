
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CampaignStatistic } from "@/types/campaign";
import { CalendarIcon, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CampaignCardProps {
  campaign: CampaignStatistic;
  compact?: boolean;
}

export const CampaignCard = ({ campaign, compact = false }: CampaignCardProps) => {
  const percentProgress = Math.min(
    Math.round((campaign.current_amount / campaign.target_amount) * 100),
    100
  );
  const formattedTarget = `£${(campaign.target_amount / 100).toFixed(2)}`;
  const formattedCurrent = `£${(campaign.current_amount / 100).toFixed(2)}`;
  const timeAgo = formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true });
  
  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg bg-slate-900/80 border-white/10 ${compact ? 'h-full' : ''}`}>
      {campaign.image_url && !compact && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className={compact ? "p-4" : "p-6"}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`font-bold text-white ${compact ? 'text-lg' : 'text-xl'} line-clamp-2`}>
              <Link to={`/campaigns/${campaign.slug}`} className="hover:text-emerald-500 transition-colors">
                {campaign.title}
              </Link>
            </h3>
            <div className="flex items-center text-xs text-slate-300 mt-1 gap-3">
              <span className="flex items-center gap-1">
                <CalendarIcon size={12} />
                {timeAgo}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {campaign.donation_count || 0} donations
              </span>
            </div>
          </div>
          
          {campaign.status === "completed" && (
            <div className="bg-green-500/20 text-green-200 text-xs py-1 px-2 rounded-full font-medium">
              Completed
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
        {!compact && (
          <p className="text-slate-300 mb-4 line-clamp-3">{campaign.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Progress</span>
            <span className="font-medium text-white">{percentProgress}%</span>
          </div>
          
          <Progress 
            value={percentProgress} 
            className="h-2 bg-slate-700" 
            indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-400"
          />
          
          <div className="flex justify-between text-sm mt-1">
            <span className="text-white font-medium">{formattedCurrent}</span>
            <span className="text-slate-400">of {formattedTarget} goal</span>
          </div>
        </div>
      </CardContent>
      
      {!compact && (
        <CardFooter className="p-6 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
              {campaign.creator_avatar ? (
                <img
                  src={campaign.creator_avatar}
                  alt={campaign.creator_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-300">
                  {campaign.creator_name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <span className="text-sm text-slate-300">{campaign.creator_name}</span>
          </div>
          <Link
            to={`/campaigns/${campaign.slug}`}
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
          >
            View details →
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};
