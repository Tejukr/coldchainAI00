import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Star, Search, Loader2, Snowflake, Weight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import BookingDialog from "@/components/BookingDialog";

type VehicleType = {
  id: string;
  vehicle_type: string;
  registration_number: string;
  capacity_tons: number;
  is_refrigerated: boolean;
  price_per_km: number;
  rating: number;
};

const vehicleLabels: Record<string, string> = {
  truck: "🚛 Truck",
  mini_truck: "🛻 Mini Truck",
  pickup: "🔧 Pickup",
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase.from("vehicles").select("*").eq("is_available", true);
      if (data) setVehicles(data as VehicleType[]);
      setLoading(false);
    };
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter(
    (v) =>
      v.vehicle_type.toLowerCase().includes(search.toLowerCase()) ||
      v.registration_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Farm Vehicles</h1>
            <p className="text-muted-foreground">Hire trucks and transport for your produce</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by type, reg number..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="h-36 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Truck className="w-12 h-12 text-primary/50" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{vehicleLabels[v.vehicle_type] || v.vehicle_type}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{v.registration_number}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-secondary font-medium">
                      <Star className="w-3.5 h-3.5 fill-current" /> {v.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Weight className="w-3.5 h-3.5" /> {v.capacity_tons}T
                    </span>
                    {v.is_refrigerated && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Snowflake className="w-3.5 h-3.5" /> Refrigerated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-foreground">₹{v.price_per_km}<span className="text-xs font-normal text-muted-foreground">/km</span></p>
                    <Button size="sm" onClick={() => setSelectedVehicle(v)}>Hire Now</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedVehicle && (
        <BookingDialog
          type="vehicle"
          item={selectedVehicle}
          open={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
      <ChatWidget />
    </div>
  );
};

export default Vehicles;
