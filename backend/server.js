import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;
const DEMO_MODE = process.env.DEMO_MODE === "true";

app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", demo_mode: DEMO_MODE, timestamp: new Date().toISOString() });
});

// ─── Mock OTP ─────────────────────────────────────────────────────────────────
app.post("/api/mock-otp/send", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });
  console.log(`📱 [Mock OTP] Sending OTP to ${phone} — Use: 123456`);
  setTimeout(() => {
    res.json({ success: true, message: `OTP sent to ${phone}`, dev_otp: "123456" });
  }, 500);
});

app.post("/api/mock-otp/verify", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP required" });
  if (otp === "123456") {
    console.log(`✅ [Mock OTP] Verified for ${phone}`);
    res.json({ success: true, verified: true });
  } else {
    res.status(401).json({ success: false, verified: false, error: "Invalid OTP. Use 123456 for demo." });
  }
});

// ─── Mock Payment ─────────────────────────────────────────────────────────────
app.post("/api/mock-payment", (req, res) => {
  const { amount, farmer_name, warehouse_name } = req.body;
  console.log(`💳 [Mock Payment] Processing ₹${amount} for ${farmer_name} → ${warehouse_name}`);
  setTimeout(() => {
    const txnId = `TXN${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    console.log(`✅ [Mock Payment] Success — ${txnId}`);
    res.json({
      status: "success",
      transaction_id: txnId,
      amount,
      timestamp: new Date().toISOString(),
      message: "Payment processed successfully",
    });
  }, 2000);
});

// ─── QR Code Generation ───────────────────────────────────────────────────────
app.post("/api/generate-qr", async (req, res) => {
  const {
    farmer_name,
    aadhar_number,
    warehouse_name,
    warehouse_location,
    crop_type,
    quantity_tons,
    start_date,
    end_date,
    total_amount,
    booking_id,
    transaction_id,
  } = req.body;

  const qrData = JSON.stringify({
    booking_id: booking_id || uuidv4(),
    farmer: farmer_name,
    aadhar: aadhar_number || "XXXX-XXXX-XXXX",
    warehouse: warehouse_name,
    location: warehouse_location,
    goods: crop_type,
    quantity_tons,
    storage_from: start_date,
    storage_to: end_date,
    total_price: `₹${total_amount}`,
    transaction_id,
    issued_at: new Date().toISOString(),
    valid_for: "Bank Loan Application",
    issuer: "AgriChain - India's Agricultural Supply Platform",
  });

  try {
    const qrImageUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: { dark: "#1a5c2e", light: "#ffffff" },
    });

    console.log(`🧾 [QR] Generated QR for booking ${booking_id}`);
    res.json({ success: true, qr_image_url: qrImageUrl, qr_data: JSON.parse(qrData) });
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// ─── AI Voice / Chat Endpoint ─────────────────────────────────────────────────
const LANGUAGE_MAP = {
  "Andhra Pradesh": { lang: "Telugu", code: "te-IN" },
  Telangana: { lang: "Telugu", code: "te-IN" },
  Karnataka: { lang: "Kannada", code: "kn-IN" },
  "Tamil Nadu": { lang: "Tamil", code: "ta-IN" },
  Maharashtra: { lang: "Marathi", code: "mr-IN" },
  Gujarat: { lang: "Gujarati", code: "gu-IN" },
  Punjab: { lang: "Punjabi", code: "pa-IN" },
  "West Bengal": { lang: "Bengali", code: "bn-IN" },
  Odisha: { lang: "Odia", code: "or-IN" },
  Kerala: { lang: "Malayalam", code: "ml-IN" },
  default: { lang: "Hindi", code: "hi-IN" },
};

const MOCK_RESPONSES = {
  find_storage: {
    en: "I found 2 warehouses near you! Hyderabad Cold Storage (50 slots, ₹120/day) and Karimnagar Grain Store (45 slots, ₹70/day). Shall I book one?",
    hi: "आपके पास 2 गोदाम उपलब्ध हैं। हैदराबाद कोल्ड स्टोरेज (50 स्लॉट, ₹120/दिन) और करीमनगर अनाज भंडार (45 स्लॉट, ₹70/दिन)। क्या मैं बुक करूँ?",
    te: "మీ దగ్గర 2 గిడ్డంగులు అందుబాటులో ఉన్నాయి! హైదరాబాద్ కోల్డ్ స్టోరేజ్ మరియు కరీంనగర్ గ్రెయిన్ స్టోర్. బుక్ చేయాలా?",
    kn: "ನಿಮ್ಮ ಹತ್ತಿರ 2 ಗೋದಾಮುಗಳು ಲಭ್ಯವಿದೆ! ಹೈದರಾಬಾದ್ ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್ ಮತ್ತು ಕರೀಮ್‌ನಗರ್. ಬುಕ್ ಮಾಡಲೇ?",
  },
  find_vehicle: {
    en: "2 vehicles found nearby! Tractor TS09AB1234 (5T, ₹12/km, 📞 9876543210) and Lorry TS07CD5678 (15T refrigerated, ₹25/km). Which one?",
    hi: "2 वाहन पास में मिले! ट्रैक्टर TS09AB1234 (5T, ₹12/km) और लॉरी TS07CD5678 (15T रेफ्रिजरेटेड, ₹25/km)। कौन सा चाहिए?",
    te: "2 వాహనాలు దగ్గర్లో ఉన్నాయి! ట్రాక్టర్ TS09AB1234 మరియు లారీ TS07CD5678 (రెఫ్రిజరేటెడ్). ఏది కావాలి?",
  },
  book_storage: {
    en: "Great! Let me help you book. Which crop type and how many tons? I'll find the best available slot.",
    hi: "बहुत अच्छा! मैं बुकिंग में मदद करता हूँ। कौन सी फसल और कितने टन? मैं सबसे अच्छा स्लॉट खोजूंगा।",
  },
};

function detectIntent(message) {
  const lower = message.toLowerCase();
  if (lower.match(/vehicle|tractor|lorry|truck|transport|गाड़ी|ट्रैक्टर|వాహన|ವಾಹನ/)) return "find_vehicle";
  if (lower.match(/book|reserve|slot|बुक|बुकिंग|బుక్|ಬುಕ್/)) return "book_storage";
  return "find_storage";
}

function detectLanguage(message) {
  if (/[\u0900-\u097F]/.test(message)) return "hi";
  if (/[\u0C00-\u0C7F]/.test(message)) return "te";
  if (/[\u0C80-\u0CFF]/.test(message)) return "kn";
  if (/[\u0B80-\u0BFF]/.test(message)) return "ta";
  if (/[\u0980-\u09FF]/.test(message)) return "bn";
  if (/[\u0A80-\u0AFF]/.test(message)) return "gu";
  if (/[\u0A00-\u0A7F]/.test(message)) return "pa";
  if (/[\u0B00-\u0B7F]/.test(message)) return "or";
  if (/[\u0D00-\u0D7F]/.test(message)) return "ml";
  return "en";
}

app.post("/api/voice", async (req, res) => {
  const { message, location, user_role = "farmer", nearby_warehouses = [], nearby_vehicles = [] } = req.body;

  if (!message) return res.status(400).json({ error: "Message required" });

  const intent = detectIntent(message);
  const language = detectLanguage(message);

  // Demo mode fallback
  if (DEMO_MODE || !process.env.GEMINI_API_KEY) {
    const responseMap = MOCK_RESPONSES[intent] || MOCK_RESPONSES.find_storage;
    const reply = responseMap[language] || responseMap.en;
    const actionMap = {
      find_storage: "navigate_storage",
      find_vehicle: "navigate_vehicles",
      book_storage: "navigate_storage",
    };
    return res.json({ intent, reply, action: actionMap[intent], language });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const stateLanguage = location?.state ? LANGUAGE_MAP[location.state] || LANGUAGE_MAP.default : LANGUAGE_MAP.default;

    const systemContext = `You are AgriBot, an AI assistant for AgriChain - India's agricultural supply chain platform.

User Role: ${user_role}
Location: ${location ? `${location.city || ""}, ${location.state || "India"}` : "India"}
Preferred Language: ${stateLanguage.lang} (but detect from user message)

Nearby Warehouses: ${nearby_warehouses.length > 0 ? JSON.stringify(nearby_warehouses.slice(0, 3)) : "Hyderabad Cold Storage (50 slots, ₹120/day), Karimnagar Grain Store (45 slots, ₹70/day)"}
Nearby Vehicles: ${nearby_vehicles.length > 0 ? JSON.stringify(nearby_vehicles.slice(0, 3)) : "Tractor TS09AB1234 (5T, ₹12/km), Lorry TS07CD5678 (15T refrigerated, ₹25/km)"}

Capabilities:
- Help farmers find nearby cold storage & standard warehouses
- Help book warehouses (guide through crop type, duration, tons)
- Connect farmers with nearby tractors and lorries
- Explain pricing, availability, QR bill system
- Assist with loan documentation using QR receipts

Supported languages: Hindi, Telugu, Kannada, Tamil, Bengali, Gujarati, Punjabi, Odia, Malayalam, English
IMPORTANT: Detect the language from the user's message and respond in THAT SAME LANGUAGE.

Response format (JSON only, no markdown):
{
  "intent": "find_storage|find_vehicle|book_storage|general_help",
  "reply": "Your response in detected language",
  "action": "navigate_storage|navigate_vehicles|open_payment|none",
  "language": "detected language code (en/hi/te/kn/ta/bn/gu/pa/or/ml)"
}`;

    const prompt = `${systemContext}\n\nUser message: "${message}"\n\nRespond with JSON only:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      parsed = {
        intent,
        reply: text,
        action: intent === "find_vehicle" ? "navigate_vehicles" : "navigate_storage",
        language,
      };
    }

    console.log(`🤖 [AI] Intent: ${parsed.intent}, Language: ${parsed.language}`);
    res.json(parsed);
  } catch (err) {
    console.error("Gemini API error:", err.message);
    // Fallback to mock
    const responseMap = MOCK_RESPONSES[intent] || MOCK_RESPONSES.find_storage;
    const reply = responseMap[language] || responseMap.en;
    const actionMap = { find_storage: "navigate_storage", find_vehicle: "navigate_vehicles", book_storage: "navigate_storage" };
    res.json({ intent, reply: reply + " (AI fallback)", action: actionMap[intent], language });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 AgriChain Backend running on http://localhost:${PORT}`);
  console.log(`📡 Demo mode: ${DEMO_MODE}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /api/health`);
  console.log(`  POST /api/mock-otp/send`);
  console.log(`  POST /api/mock-otp/verify`);
  console.log(`  POST /api/mock-payment`);
  console.log(`  POST /api/generate-qr`);
  console.log(`  POST /api/voice\n`);
});
