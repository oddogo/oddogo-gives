
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { PaymentForm } from "@/components/PaymentForm";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1F3C] text-white p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Make a Payment</h1>
        {user ? (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6">
            <PaymentForm user={user} />
          </Card>
        ) : (
          <div className="text-center py-8">
            Please sign in to make a payment
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
