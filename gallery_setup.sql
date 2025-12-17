-- Create the gallery table
CREATE TABLE public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    caption TEXT,
    location TEXT,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Create Policy: Allow public read access
CREATE POLICY "Public gallery items are viewable by everyone" ON public.gallery
    FOR SELECT USING (true);

-- Create Policy: Allow admin full access
CREATE POLICY "Admins can insert gallery items" ON public.gallery
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update gallery items" ON public.gallery
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete gallery items" ON public.gallery
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for featured images
CREATE INDEX idx_gallery_featured ON public.gallery(featured, created_at DESC);

-- Create index for category filtering
CREATE INDEX idx_gallery_category ON public.gallery(category);
