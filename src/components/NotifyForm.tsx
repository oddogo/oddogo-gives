
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const NotifyForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Redirect to Oddogo.co.uk
    window.location.href = "https://oddogo.co.uk";
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/5 border-white/10"
        required
      />
      <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
        Register Now
      </Button>
    </form>
  );
};
