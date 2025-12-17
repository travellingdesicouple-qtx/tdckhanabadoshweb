-- Create table for About Section info
create table if not exists about_info (
  id uuid default gen_random_uuid() primary key,
  years_of_travel numeric default 0,
  images_taken numeric default 0,
  countries_visited numeric default 0,
  subscribers numeric default 0,
  about_text text,
  main_image text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table about_info enable row level security;

-- Policy for Reading (Public)
create policy "Enable read access for all users"
on about_info for select
using (true);

-- Policy for Inserting (Public/Admin)
-- Note: In a real production app with auth, you'd restrict this.
-- For now allowing public insert/update as per your setup.
create policy "Enable insert for all users"
on about_info for insert
with check (true);

-- Policy for Updating (Public/Admin)
create policy "Enable update for all users"
on about_info for update
using (true);

-- Insert a default row if empty
insert into about_info (about_text)
select 'Welcome to TDC Khanabadosh!'
where not exists (select 1 from about_info);
