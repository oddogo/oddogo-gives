
import { Fingerprint } from "lucide-react";
import { NotifyForm } from "@/components/NotifyForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-[#2C3E50] text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center space-y-12 text-center">
          <div className="animate-float">
            <Fingerprint size={80} className="text-primary animate-pulse" />
          </div>
          
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Your Digital Fingerprint for Public Giving
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Coming soon - a revolutionary platform that will transform how we track and celebrate public giving. Create your unique fingerprint profile and make a lasting impact.
            </p>
          </div>

          <div className="w-full max-w-md">
            <p className="text-gray-400 mb-4">
              Be the first to know when we launch
            </p>
            <NotifyForm />
          </div>

          <div className="pt-12">
            <p className="text-sm text-gray-400">
              © 2024 Fingerprint Profile. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
