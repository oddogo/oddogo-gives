
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export const NotifyForm = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Here you would typically send this to your backend
    console.log("Email submitted:", email);
    
    toast({
      title: "Thank you for your interest!",
      description: "We'll notify you when we launch.",
    });
    
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/10 border-white/20"
        required
      />
      <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
        Notify Me
      </Button>
    </form>
  );
};
