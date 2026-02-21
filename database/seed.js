import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../.env") });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const warehouses = [
  {
    name: "Hyderabad Cold Storage",
    address: "Kondapur, HITEC City",
    city: "Hyderabad",
    lat: 17.385,
    lng: 78.486,
    temperature_min: -5,
    temperature_max: 5,
    total_slots: 100,
    available_slots: 50,
    price_per_day: 120,
    storage_type: "cold_storage",
    total_capacity_tons: 500,
    available_capacity_tons: 250,
    price_per_ton_day: 25,
    rating: 4.8,
    description: "Premium cold storage facility in HITEC City with 24/7 monitoring.",
    is_active: true,
  },
  {
    name: "Bengaluru AgriVault",
    address: "Yeshwanthpur Industrial Area",
    city: "Bengaluru",
    lat: 13.0274,
    lng: 77.5495,
    temperature_min: 0,
    temperature_max: 8,
    total_slots: 80,
    available_slots: 30,
    price_per_day: 150,
    storage_type: "cold_storage",
    total_capacity_tons: 400,
    available_capacity_tons: 150,
    price_per_ton_day: 30,
    rating: 4.6,
    description: "ISO-certified cold warehouse near key transport corridors.",
    is_active: true,
  },
  {
    name: "Karimnagar Grain Store",
    address: "Manakondur Road, Karimnagar",
    city: "Karimnagar",
    lat: 18.4386,
    lng: 79.1288,
    temperature_min: 15,
    temperature_max: 30,
    total_slots: 60,
    available_slots: 45,
    price_per_day: 70,
    storage_type: "standard",
    total_capacity_tons: 300,
    available_capacity_tons: 220,
    price_per_ton_day: 12,
    rating: 4.3,
    description: "Dry grain storage for paddy, maize, and pulses.",
    is_active: true,
  },
  {
    name: "Mumbai FreshKeep Cold Chain",
    address: "Navi Mumbai APMC",
    city: "Mumbai",
    lat: 19.076,
    lng: 72.8777,
    temperature_min: 2,
    temperature_max: 8,
    total_slots: 120,
    available_slots: 70,
    price_per_day: 200,
    storage_type: "cold_storage",
    total_capacity_tons: 600,
    available_capacity_tons: 350,
    price_per_ton_day: 40,
    rating: 4.9,
    description: "State-of-the-art cold chain facility serving APMC traders.",
    is_active: true,
  },
  {
    name: "Warangal Standard Godown",
    address: "Station Road, Warangal",
    city: "Warangal",
    lat: 17.9784,
    lng: 79.5941,
    temperature_min: 15,
    temperature_max: 35,
    total_slots: 50,
    available_slots: 35,
    price_per_day: 60,
    storage_type: "standard",
    total_capacity_tons: 200,
    available_capacity_tons: 140,
    price_per_ton_day: 10,
    rating: 4.1,
    description: "Budget-friendly dry storage for seasonal produce.",
    is_active: true,
  },
];

const vehicles = [
  {
    vehicle_type: "tractor",
    registration_number: "TS09AB1234",
    capacity_tons: 5,
    is_refrigerated: false,
    price_per_km: 12,
    lat: 17.39,
    lng: 78.48,
    driver_phone: "9876543210",
    is_available: true,
    rating: 4.5,
    description: "Reliable tractor for short-distance farm transport.",
  },
  {
    vehicle_type: "lorry",
    registration_number: "TS07CD5678",
    capacity_tons: 15,
    is_refrigerated: true,
    price_per_km: 25,
    lat: 17.42,
    lng: 78.5,
    driver_phone: "9123456789",
    is_available: true,
    rating: 4.7,
    description: "Refrigerated lorry for long-distance cold chain transport.",
  },
  {
    vehicle_type: "lorry",
    registration_number: "KA04EF9012",
    capacity_tons: 10,
    is_refrigerated: false,
    price_per_km: 18,
    lat: 13.031,
    lng: 77.555,
    driver_phone: "8765432109",
    is_available: true,
    rating: 4.4,
    description: "Standard lorry for bulk produce transport in Bengaluru region.",
  },
  {
    vehicle_type: "tractor",
    registration_number: "MH12GH3456",
    capacity_tons: 3,
    is_refrigerated: false,
    price_per_km: 10,
    lat: 19.08,
    lng: 72.88,
    driver_phone: "7654321098",
    is_available: true,
    rating: 4.2,
    description: "Light tractor ideal for last-mile delivery.",
  },
];

async function seed() {
  console.log("🌱 Starting database seeding...");

  // Check if already seeded
  const { data: existing } = await supabase
    .from("warehouses")
    .select("id")
    .eq("name", "Hyderabad Cold Storage");

  if (existing && existing.length > 0) {
    console.log("⚠️  Database already seeded. Skipping warehouse inserts.");
  } else {
    // Insert warehouses (without owner_id to allow public seed)
    // We use a placeholder owner_id - real app would use actual user UUIDs
    const demoOwnerId = "00000000-0000-0000-0000-000000000001";

    const warehousesWithOwner = warehouses.map((w) => ({
      ...w,
      owner_id: demoOwnerId,
    }));

    const { data: wData, error: wError } = await supabase
      .from("warehouses")
      .insert(warehousesWithOwner)
      .select();

    if (wError) {
      console.error("❌ Warehouse seed failed:", wError.message);
    } else {
      console.log(`✅ Inserted ${wData.length} warehouses`);
    }
  }

  // Check vehicles
  const { data: existingVeh } = await supabase
    .from("vehicles")
    .select("id")
    .eq("registration_number", "TS09AB1234");

  if (existingVeh && existingVeh.length > 0) {
    console.log("⚠️  Vehicles already seeded. Skipping vehicle inserts.");
  } else {
    const demoVehicleOwnerId = "00000000-0000-0000-0000-000000000002";

    const vehiclesWithOwner = vehicles.map((v) => ({
      ...v,
      owner_id: demoVehicleOwnerId,
    }));

    const { data: vData, error: vError } = await supabase
      .from("vehicles")
      .insert(vehiclesWithOwner)
      .select();

    if (vError) {
      console.error("❌ Vehicle seed failed:", vError.message);
    } else {
      console.log(`✅ Inserted ${vData.length} vehicles`);
    }
  }

  console.log("\n🎉 Seeding complete!");
  console.log("\n📊 Demo Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Role: Farmer       | Phone: 9999999999");
  console.log("Role: Warehouse    | Phone: 8888888888");
  console.log("Role: Vehicle      | Phone: 7777777777");
  console.log("Mock OTP Code: 123456 (works for any phone)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

seed().catch(console.error);
