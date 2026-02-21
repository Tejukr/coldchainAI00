
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('farmer', 'warehouse_owner', 'vehicle_owner', 'admin');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'farmer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

-- Warehouses table
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  temperature_min DOUBLE PRECISION DEFAULT 0,
  temperature_max DOUBLE PRECISION DEFAULT 10,
  total_slots INTEGER NOT NULL DEFAULT 10,
  available_slots INTEGER NOT NULL DEFAULT 10,
  price_per_day NUMERIC(10,2) NOT NULL DEFAULT 100,
  rating NUMERIC(2,1) DEFAULT 4.0,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active warehouses" ON public.warehouses FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage own warehouses" ON public.warehouses FOR ALL USING (auth.uid() = owner_id);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'truck',
  registration_number TEXT NOT NULL,
  capacity_tons NUMERIC(5,2) NOT NULL DEFAULT 5,
  is_refrigerated BOOLEAN DEFAULT false,
  price_per_km NUMERIC(6,2) NOT NULL DEFAULT 15,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_available BOOLEAN DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 4.0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available vehicles" ON public.vehicles FOR SELECT USING (is_available = true);
CREATE POLICY "Owners can manage own vehicles" ON public.vehicles FOR ALL USING (auth.uid() = owner_id);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  booking_type TEXT NOT NULL CHECK (booking_type IN ('warehouse', 'vehicle')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  total_amount NUMERIC(10,2),
  crop_type TEXT,
  quantity_tons NUMERIC(5,2),
  qr_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Warehouse owners can view bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.warehouses WHERE id = warehouse_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.vehicles WHERE id = vehicle_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can update booking status" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.warehouses WHERE id = warehouse_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.vehicles WHERE id = vehicle_id AND owner_id = auth.uid())
  OR auth.uid() = farmer_id
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
