-- Enable RLS
alter table if exists public.products enable row level security;
alter table if exists public.advertisements enable row level security;
alter table if exists public.reels enable row level security;
alter table if exists public.gallery enable row level security;

-- 1. ADVERTISEMENTS TABLE UPDATE
-- Add 'logo' size and 'brand_partner' placement if checking constraints exists
-- Or just create the table if it doesn't exist

CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('banner', 'square', 'sidebar', 'leaderboard', 'logo')),
    placement TEXT NOT NULL CHECK (placement IN ('blogs', 'adventures', 'shop', 'homepage', 'brand_partner')),
    image_url TEXT NOT NULL,
    link_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- If table exists, update constraints
DO $$ 
BEGIN 
    -- Update placement check constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'advertisements_placement_check') THEN
        ALTER TABLE public.advertisements DROP CONSTRAINT advertisements_placement_check;
        ALTER TABLE public.advertisements ADD CONSTRAINT advertisements_placement_check 
        CHECK (placement IN ('blogs', 'adventures', 'shop', 'homepage', 'brand_partner'));
    END IF;

    -- Update size check constraint
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'advertisements_size_check') THEN
        ALTER TABLE public.advertisements DROP CONSTRAINT advertisements_size_check;
        ALTER TABLE public.advertisements ADD CONSTRAINT advertisements_size_check 
        CHECK (size IN ('banner', 'square', 'sidebar', 'leaderboard', 'logo'));
    END IF;
END $$;


-- 2. PRODUCTS TABLE UPDATE
-- Ensure cover_image is TEXT (it usually is, but good to verify schema)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    product_type TEXT,
    description TEXT,
    features TEXT[],
    cover_image TEXT NOT NULL, -- Supports URL or Path
    download_link TEXT,
    external_link TEXT,
    in_stock BOOLEAN DEFAULT true,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. REELS TABLE UPDATE
-- Add tags column
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    video_url TEXT NOT NULL,
    duration TEXT,
    views INTEGER DEFAULT 0,
    tags TEXT[], -- Array of strings for SEO tags
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add tags column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reels' AND column_name = 'tags') THEN
        ALTER TABLE public.reels ADD COLUMN tags TEXT[];
    END IF;
END $$;


-- 4. POLICIES (Example: Public Read, Admin Write)
-- Repeat for all tables as needed
CREATE POLICY "Public read access" ON public.advertisements FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.advertisements USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.products USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON public.reels FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.reels USING (auth.role() = 'authenticated');
