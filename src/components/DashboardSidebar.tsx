
import { User } from "@supabase/supabase-js";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Home, PieChart, Settings, LogOut, UserCircle, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardSidebarProps {
  user: User | null;
  onSignOut: () => void;
}

export const DashboardSidebar = ({ user, onSignOut }: DashboardSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-black/20 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
      <div className="mb-12">
        <Logo />
      </div>
      
      <nav className="flex-1">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate('/dashboard')}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate('/profile')}
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <PieChart className="mr-2 h-4 w-4" />
            Allocations
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate('/transactions')}
          >
            <Receipt className="mr-2 h-4 w-4" />
            Transactions
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </nav>

      <Button
        variant="ghost"
        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
        onClick={onSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};
