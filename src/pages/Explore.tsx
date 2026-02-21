import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Warehouse, MapPin, Thermometer, Star, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import BookingDialog from "@/components/BookingDialog";

type WarehouseType = {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  temperature_min: number;
  temperature_max: number;
  total_slots: number;
  available_slots: number;
  price_per_day: number;
  rating: number;
  description: string;
};

const Explore = () => {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseType | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const { data } = await supabase.from("warehouses").select("*").eq("is_active", true);
      if (data) setWarehouses(data as WarehouseType[]);
      setLoading(false);
    };
    fetchWarehouses();
  }, []);

  const filtered = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.address.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Cold Storages</h1>
            <p className="text-muted-foreground">Find and book temperature-controlled warehouses near Bengaluru</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, area..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((w, i) => (
              <motion.div
                key={w.id}
                className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="h-36 bg-gradient-hero flex items-center justify-center">
                  <Warehouse className="w-12 h-12 text-primary-foreground/70" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-semibold text-foreground">{w.name}</h3>
                    <span className="flex items-center gap-1 text-sm text-secondary font-medium">
                      <Star className="w-3.5 h-3.5 fill-current" /> {w.rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" /> {w.address}, {w.city}
                  </p>
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <span className="flex items-center gap-1 text-accent-foreground">
                      <Thermometer className="w-3.5 h-3.5" /> {w.temperature_min}°C to {w.temperature_max}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{w.available_slots}/{w.total_slots} slots</p>
                      <p className="font-display font-bold text-foreground">₹{w.price_per_day}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
                    </div>
                    <Button size="sm" onClick={() => setSelectedWarehouse(w)} disabled={w.available_slots === 0}>
                      {w.available_slots > 0 ? "Book Now" : "Full"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedWarehouse && (
        <BookingDialog
          type="warehouse"
          item={selectedWarehouse}
          open={!!selectedWarehouse}
          onClose={() => setSelectedWarehouse(null)}
        />
      )}
      <ChatWidget />
    </div>
  );
};

export default Explore;
