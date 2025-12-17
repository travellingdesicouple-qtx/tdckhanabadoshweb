-- Add external_link column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS external_link TEXT;

COMMENT ON COLUMN public.products.external_link IS 'Optional external product link (Gumroad, Amazon, etc.). If provided, Buy Now redirects here instead of internal checkout.';
