import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import { Truck, Package, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const VehicleDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [vRes, bRes] = await Promise.all([
        supabase.from("vehicles").select("*").eq("owner_id", user.id),
        supabase.from("bookings").select("*").eq("booking_type", "vehicle").order("created_at", { ascending: false }),
      ]);
      if (vRes.data) setVehicles(vRes.data);
      const vehicleIds = (vRes.data || []).map((v: any) => v.id);
      if (bRes.data) setBookings(bRes.data.filter((b: any) => vehicleIds.includes(b.vehicle_id)));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      toast({ title: `Booking ${status}` });
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Vehicle Dashboard 🚛</h1>
          <p className="text-muted-foreground">Manage your fleet and incoming transport requests</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-accent border border-border">
            <Truck className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-display font-bold text-foreground">{vehicles.length}</p>
            <p className="text-xs text-muted-foreground">Vehicles</p>
          </div>
          <div className="p-4 rounded-xl bg-accent border border-border">
            <Package className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-display font-bold text-foreground">{bookings.length}</p>
            <p className="text-xs text-muted-foreground">Jobs</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/10 border border-border">
            <Clock className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-display font-bold text-foreground">{bookings.filter((b) => b.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>

        <h2 className="text-xl font-display font-semibold text-foreground mb-4">Transport Requests</h2>
        {bookings.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No transport requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <motion.div key={b.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div>
                  <p className="font-medium text-foreground">{b.crop_type || "Transport"} • {b.quantity_tons}T</p>
                  <p className="text-xs text-muted-foreground">{b.start_date} • ₹{b.total_amount}</p>
                </div>
                <div className="flex gap-2">
                  {b.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")}>Decline</Button>
                    </>
                  )}
                  {b.status !== "pending" && (
                    <span className="text-sm font-medium capitalize text-muted-foreground">{b.status}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <ChatWidget />
    </div>
  );
};

export default VehicleDashboard;
