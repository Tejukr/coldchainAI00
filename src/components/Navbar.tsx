import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Warehouse, Truck, Sprout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!profile) return "/dashboard";
    switch (profile.role) {
      case "warehouse_owner": return "/warehouse-dashboard";
      case "vehicle_owner": return "/vehicle-dashboard";
      default: return "/dashboard";
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">AgriStore</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="flex items-center gap-1.5"><Warehouse className="w-4 h-4" /> Cold Storages</span>
            </Link>
            <Link to="/vehicles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Vehicles</span>
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardLink()}>
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign Out</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth"><Button variant="ghost" size="sm">Log In</Button></Link>
                <Link to="/auth?mode=signup"><Button size="sm">Get Started</Button></Link>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/explore" className="block px-3 py-2 text-sm rounded-md hover:bg-accent" onClick={() => setIsOpen(false)}>Cold Storages</Link>
            <Link to="/vehicles" className="block px-3 py-2 text-sm rounded-md hover:bg-accent" onClick={() => setIsOpen(false)}>Vehicles</Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block px-3 py-2 text-sm rounded-md hover:bg-accent" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <button className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent" onClick={handleSignOut}>Sign Out</button>
              </>
            ) : (
              <Link to="/auth" className="block px-3 py-2 text-sm rounded-md hover:bg-accent" onClick={() => setIsOpen(false)}>Log In / Sign Up</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
