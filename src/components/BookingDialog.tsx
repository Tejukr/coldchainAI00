import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  type: "warehouse" | "vehicle";
  item: any;
  open: boolean;
  onClose: () => void;
};

const BookingDialog = ({ type, item, open, onClose }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cropType, setCropType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBook = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need an account to book.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!startDate) {
      toast({ title: "Select a date", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const qrCode = `AGRI-${Date.now().toString(36).toUpperCase()}`;
      const bookingData: any = {
        farmer_id: user.id,
        booking_type: type,
        start_date: startDate,
        end_date: endDate || startDate,
        crop_type: cropType,
        quantity_tons: quantity ? parseFloat(quantity) : null,
        qr_code: qrCode,
        status: "pending",
      };
      if (type === "warehouse") {
        bookingData.warehouse_id = item.id;
        const days = endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1 : 1;
        bookingData.total_amount = item.price_per_day * days;
      } else {
        bookingData.vehicle_id = item.id;
        bookingData.total_amount = item.price_per_km * 50; // estimate 50km
      }

      const { error } = await supabase.from("bookings").insert(bookingData);
      if (error) throw error;
      setBooked(true);
      toast({ title: "Booking confirmed! 🎉", description: `Your QR code: ${qrCode}` });
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Booking Confirmed!</h3>
            <p className="text-muted-foreground text-sm">Your booking has been submitted. You'll receive a confirmation shortly.</p>
            <Button className="mt-6" onClick={onClose}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Book {type === "warehouse" ? item.name : `${item.vehicle_type} - ${item.registration_number}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Crop Type</Label>
            <Input placeholder="e.g. Potatoes, Rice" value={cropType} onChange={(e) => setCropType(e.target.value)} />
          </div>
          <div>
            <Label>Quantity (tons)</Label>
            <Input type="number" placeholder="e.g. 5" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="bg-accent rounded-lg p-3">
            <p className="text-sm text-accent-foreground">
              {type === "warehouse"
                ? `₹${item.price_per_day}/day • ${item.available_slots} slots available`
                : `₹${item.price_per_km}/km • ${item.capacity_tons}T capacity`}
            </p>
          </div>
          <Button className="w-full" onClick={handleBook} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
