-- ====================================
-- Migration: 015_create_profile_on_signup.sql
-- Description: Create trigger to insert profile on user signup
-- Author: [Tu Nombre]
-- Date: [Fecha]
-- ====================================

-- Function to create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name, is_admin, created_at)
  values (new.id, new.raw_user_meta_data->>'display_name', false, now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for inserting new profiles
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for reading profiles
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Policy for updating own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting own profile (optional, if needed)
CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
USING (auth.uid() = user_id);

-- === Authenticated SELECT policies for public tables ===
CREATE POLICY "Authenticated read: cities" ON cities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: districts" ON districts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: neighbourhoods" ON neighbourhoods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: geographical_levels" ON geographical_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: indicator_definitions" ON indicator_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: indicators" ON indicators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: feature_definitions" ON feature_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read: point_features" ON point_features FOR SELECT TO authenticated USING (true);

-- ================================================
-- End of migration 015_create_profile_on_signup.sql
-- ================================================