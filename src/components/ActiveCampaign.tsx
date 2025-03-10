
import { Zap } from "lucide-react";

export const ActiveCampaign = () => {
  return (
    <div className="text-center px-4 sm:px-0">
      <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full mb-4">
        <Zap className="w-4 h-4" />
        <span>Active Campaign</span>
      </div>
      <h3 className="text-2xl font-semibold mb-4 text-black">Marathon Fundraiser</h3>
      <p className="text-gray-600 max-w-2xl mx-auto">
        I'm running my first marathon to support causes that are close to my heart.
        Every mile I run will help fund my Giving Fingerprint and support these amazing organizations.
      </p>
    </div>
  );
};
