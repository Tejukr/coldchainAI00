
-- Enhancement migration: Add new fields to existing tables

-- Add phone and aadhar to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS aadhar_number TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Telangana';

-- Add storage type and capacity to warehouses  
ALTER TABLE public.warehouses 
  ADD COLUMN IF NOT EXISTS storage_type TEXT DEFAULT 'cold_storage' CHECK (storage_type IN ('standard', 'cold_storage')),
  ADD COLUMN IF NOT EXISTS total_capacity_tons NUMERIC(8,2) DEFAULT 100,
  ADD COLUMN IF NOT EXISTS available_capacity_tons NUMERIC(8,2) DEFAULT 100,
  ADD COLUMN IF NOT EXISTS price_per_ton_day NUMERIC(8,2) DEFAULT 20;

-- Add vehicle-specific fields
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS driver_phone TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Override vehicle_type to allow tractor/lorry (in addition to truck/mini_truck/pickup)
-- No change needed - TEXT column already flexible

-- Enhance bookings table
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS aadhar_number TEXT,
  ADD COLUMN IF NOT EXISTS qr_image_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Update warehouses RLS to allow public insert for seeding (in dev)
-- Note: In prod, this would be restricted
CREATE POLICY IF NOT EXISTS "Public insert for seeding" ON public.warehouses FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Public insert vehicles for seeding" ON public.vehicles FOR INSERT WITH CHECK (true);
