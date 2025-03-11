
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DebugFooterProps {
  user: User | null;
}

export const DebugFooter = ({ user }: DebugFooterProps) => {
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFingerprint = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('fingerprints_users')
        .select('fingerprint_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setFingerprintId(data.fingerprint_id);
      }
    };

    fetchFingerprint();
  }, [user]);

  if (!user) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 text-xs font-mono">
      <div className="container mx-auto">
        <details>
          <summary className="cursor-pointer hover:text-gray-300">Debug Information</summary>
          <div className="mt-2 space-y-1">
            <p>User ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Fingerprint ID: {fingerprintId || 'Loading...'}</p>
          </div>
        </details>
      </div>
    </footer>
  );
};
