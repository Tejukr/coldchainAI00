import { QrCode, Shield } from "lucide-react";

type Props = {
  qrImageUrl: string;
  farmerName?: string;
  warehouseName?: string;
  cropType?: string;
  duration?: string;
  amount?: number;
};

const QRDisplay = ({ qrImageUrl, farmerName, warehouseName, cropType, duration, amount }: Props) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
          <QrCode className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-display font-semibold text-green-800 text-sm">Digital Receipt & QR Code</p>
          <p className="text-xs text-green-600">Valid for Bank Loan Applications</p>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0">
          <img src={qrImageUrl} alt="Booking QR Code" className="w-32 h-32 rounded-xl border-2 border-green-200 bg-white p-1" />
        </div>
        <div className="flex-1 space-y-1.5">
          {farmerName && (
            <div>
              <p className="text-xs text-muted-foreground">Farmer</p>
              <p className="text-sm font-medium text-foreground">{farmerName}</p>
            </div>
          )}
          {warehouseName && (
            <div>
              <p className="text-xs text-muted-foreground">Warehouse</p>
              <p className="text-sm font-medium text-foreground">{warehouseName}</p>
            </div>
          )}
          {cropType && (
            <div>
              <p className="text-xs text-muted-foreground">Crop</p>
              <p className="text-sm font-medium text-foreground">{cropType}</p>
            </div>
          )}
          {duration && (
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium text-foreground">{duration}</p>
            </div>
          )}
          {amount && (
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-sm font-bold text-green-700">₹{amount.toLocaleString("en-IN")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 bg-green-100 rounded-lg px-3 py-2">
        <Shield className="w-3.5 h-3.5 text-green-700 flex-shrink-0" />
        <p className="text-xs text-green-700">
          This QR code is legally valid proof for agricultural bank loan applications (Kisan Credit Card, PM Kisan, etc.)
        </p>
      </div>
    </div>
  );
};

export default QRDisplay;
