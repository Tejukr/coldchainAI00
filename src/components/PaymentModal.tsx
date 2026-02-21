import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  amount: number;
  farmerName?: string;
  warehouseName?: string;
  onSuccess: (transactionId: string) => void;
  onClose: () => void;
};

type Stage = "idle" | "processing" | "success";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const PaymentModal = ({ open, amount, farmerName, warehouseName, onSuccess, onClose }: Props) => {
  const [stage, setStage] = useState<Stage>("idle");
  const [txnId, setTxnId] = useState("");

  useEffect(() => {
    if (open) setStage("idle");
  }, [open]);

  const handlePay = async () => {
    setStage("processing");
    try {
      const res = await fetch(`${BACKEND_URL}/api/mock-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, farmer_name: farmerName, warehouse_name: warehouseName }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setTxnId(data.transaction_id);
        setStage("success");
        onSuccess(data.transaction_id);
      }
    } catch {
      // Fallback in case backend is down
      const fakeTxn = `TXN${Date.now().toString().slice(-8)}`;
      setTxnId(fakeTxn);
      setStage("success");
      onSuccess(fakeTxn);
    }
  };

  return (
    <Dialog open={open} onOpenChange={stage === "processing" ? undefined : onClose}>
      <DialogContent className="sm:max-w-sm text-center">
        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">Secure Payment</h3>
              <p className="text-muted-foreground text-sm mb-2">{warehouseName}</p>
              <div className="bg-accent rounded-xl p-4 mb-6">
                <p className="text-3xl font-display font-extrabold text-foreground">₹{amount?.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Amount</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-primary to-secondary text-white" onClick={handlePay}>
                  Pay Now →
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">🔒 Secured by AgriChain | Mock Payment Demo</p>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-10">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">Processing Payment...</h3>
              <p className="text-sm text-muted-foreground">Please wait, do not close this window</p>
              <div className="flex justify-center gap-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </motion.div>
          )}

          {stage === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="py-4">
              <motion.div
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">Payment Successful! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-4">Your slot is booked</p>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
                <p className="text-xs text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm font-semibold text-green-700">{txnId}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                ✅ Payment Successful — Waiting for QR Bill from warehouse owner
              </p>
              <Button className="w-full" onClick={onClose}>Go to Dashboard →</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
