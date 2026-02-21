import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import { Warehouse, Truck, Package, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

type Booking = {
  id: string;
  booking_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  crop_type: string | null;
  total_amount: number | null;
  qr_code: string | null;
  created_at: string;
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
  in_progress: Package,
};

const statusColors: Record<string, string> = {
  pending: "text-secondary",
  confirmed: "text-primary",
  completed: "text-primary",
  cancelled: "text-destructive",
  in_progress: "text-secondary",
};

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("bookings").select("*").eq("farmer_id", user.id).order("created_at", { ascending: false });
      if (data) setBookings(data as Booking[]);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `farmer_id=eq.${user.id}` }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const warehouseBookings = bookings.filter((b) => b.booking_type === "warehouse");
  const vehicleBookings = bookings.filter((b) => b.booking_type === "vehicle");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome, {profile?.full_name || "Farmer"} 🌾
          </h1>
          <p className="text-muted-foreground">Manage your bookings and track your cargo</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: bookings.length, icon: Package, color: "bg-accent" },
            { label: "Warehouse", value: warehouseBookings.length, icon: Warehouse, color: "bg-accent" },
            { label: "Vehicle", value: vehicleBookings.length, icon: Truck, color: "bg-secondary/10" },
            { label: "Pending", value: bookings.filter((b) => b.status === "pending").length, icon: Clock, color: "bg-secondary/10" },
          ].map((s, i) => (
            <motion.div key={s.label} className={`p-4 rounded-xl ${s.color} border border-border`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <s.icon className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <Link to="/explore"><Button><Warehouse className="w-4 h-4 mr-2" /> Book Storage</Button></Link>
          <Link to="/vehicles"><Button variant="outline"><Truck className="w-4 h-4 mr-2" /> Hire Vehicle</Button></Link>
        </div>

        {/* Bookings List */}
        <h2 className="text-xl font-display font-semibold text-foreground mb-4">Your Bookings</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bookings yet. Start by exploring cold storages!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const Icon = statusIcons[b.status] || Clock;
              return (
                <motion.div
                  key={b.id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                      {b.booking_type === "warehouse" ? <Warehouse className="w-5 h-5 text-accent-foreground" /> : <Truck className="w-5 h-5 text-accent-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">{b.booking_type} Booking</p>
                      <p className="text-xs text-muted-foreground">{b.start_date}{b.end_date && b.end_date !== b.start_date ? ` → ${b.end_date}` : ""} {b.crop_type && `• ${b.crop_type}`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 text-sm font-medium ${statusColors[b.status]}`}>
                      <Icon className="w-4 h-4" /> {b.status}
                    </div>
                    {b.total_amount && <p className="text-xs text-muted-foreground">₹{b.total_amount}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
