-- Create adventures table if it does not exist
create table if not exists adventures (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  location text not null,
  description text,
  cover_image text,
  category text,
  youtube_video_id text not null,
  duration text,
  difficulty text,
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for adventures (safe to run if already enabled)
alter table adventures enable row level security;

-- Drop existing policies on adventures to avoid "policy already exists" error
drop policy if exists "Enable read access for all users" on adventures;
drop policy if exists "Enable insert for authenticated users only" on adventures;
drop policy if exists "Enable update for authenticated users only" on adventures;
drop policy if exists "Enable delete for authenticated users only" on adventures;

-- Re-create policies for adventures
create policy "Enable read access for all users"
on adventures for select
using (true);

create policy "Enable insert for authenticated users only"
on adventures for insert
with check (true);

create policy "Enable update for authenticated users only"
on adventures for update
using (true);

-- Add Country and City columns to adventures table
alter table adventures 
add column if not exists country text,
add column if not exists city text;

-- Create Main Playlists (Countries) table
create table if not exists country_playlists (
  country_name text primary key,
  image_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create Sub Playlists (Cities) table
create table if not exists city_playlists (
  city_name text primary key,
  country_name text, -- Foreign key removed to avoid strict constraint initially
  image_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for Countries
alter table country_playlists enable row level security;

-- Drop existing policies for country_playlists
drop policy if exists "Enable read access for all users" on country_playlists;
drop policy if exists "Enable insert for authenticated users only" on country_playlists;
drop policy if exists "Enable update for authenticated users only" on country_playlists;
drop policy if exists "Enable delete for authenticated users only" on country_playlists;

-- Create policies for country_playlists
create policy "Enable read access for all users"
on country_playlists for select
using (true);

create policy "Enable insert for authenticated users only"
on country_playlists for insert
with check (true);

create policy "Enable update for authenticated users only"
on country_playlists for update
using (true);

create policy "Enable delete for authenticated users only"
on country_playlists for delete
using (true);


-- Enable RLS for Cities
alter table city_playlists enable row level security;

-- Drop existing policies for city_playlists
drop policy if exists "Enable read access for all users" on city_playlists;
drop policy if exists "Enable insert for authenticated users only" on city_playlists;
drop policy if exists "Enable update for authenticated users only" on city_playlists;
drop policy if exists "Enable delete for authenticated users only" on city_playlists;

-- Create policies for city_playlists
create policy "Enable read access for all users"
on city_playlists for select
using (true);

create policy "Enable insert for authenticated users only"
on city_playlists for insert
with check (true);

create policy "Enable update for authenticated users only"
on city_playlists for update
using (true);

create policy "Enable delete for authenticated users only"
on city_playlists for delete
using (true);
