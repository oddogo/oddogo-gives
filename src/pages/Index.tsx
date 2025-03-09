
import { NotifyForm } from "@/components/NotifyForm";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { RegisterInterestForm } from "@/components/RegisterInterestForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#008080] text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center space-y-12 text-center">
          <div className="animate-float">
            <img 
              src="/lovable-uploads/73c9c40f-6400-4389-aec9-42268145ca00.png"
              alt="Oddogo Logo"
              className="h-12 md:h-16"
            />
          </div>
          
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Your Digital Identity for <span className="text-primary">Public Giving</span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Website and Pilot coming soon - join the revolution in transparent public giving. Create your unique profile and make a lasting impact with Oddogo.
            </p>
          </div>

          <div className="w-full max-w-md space-y-8">
            <div>
              <p className="text-gray-400 mb-4">Register your interest</p>
              <RegisterInterestForm />
            </div>
          </div>

          <div className="space-y-4">
            <Button onClick={() => window.location.href = "/auth"} variant="outline">
              Sign In / Sign Up
            </Button>
          </div>

          <div className="pt-12">
            <p className="text-sm text-gray-400">
              © 2024 Oddogo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
