import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Link as LinkIcon, Loader } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { adsApi, Advertisement } from '../../../lib/api';
import { toast } from 'sonner';

export function BrandManager() {
    const [brands, setBrands] = useState<Advertisement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [useImageUrl, setUseImageUrl] = useState(false);

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        try {
            const allAds = await adsApi.getActive();
            // Filter for brand partners only
            const brandAds = allAds.filter(ad => ad.placement === 'brand_partner');
            setBrands(brandAds);
        } catch (error) {
            console.error('Failed to load brands:', error);
            toast.error('Failed to load brand logos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            toast.error('Please enter a brand name');
            return;
        }
        if (!uploadedImage && !imageUrl) {
            toast.error('Please provide a logo image');
            return;
        }

        setIsAdding(true);

        try {
            const adData = {
                title,
                link_url: linkUrl || '#', // Optional link
                placement: 'brand_partner' as const,
                size: 'logo' as const,
                active: true,
                start_date: new Date().toISOString(),
            };

            const { error } = await adsApi.create(adData, useImageUrl ? imageUrl : uploadedImage!);

            if (error) throw error;

            toast.success('Brand logo added successfully');
            // Reset form
            setTitle('');
            setLinkUrl('');
            setImageUrl('');
            setUploadedImage(null);
            setUseImageUrl(false);

            // Reload list
            loadBrands();
        } catch (error) {
            console.error('Error adding brand:', error);
            toast.error('Failed to add brand logo');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this brand logo?')) return;

        try {
            const { error } = await adsApi.delete(id);
            if (error) throw error;

            toast.success('Brand logo removed');
            setBrands(brands.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error('Failed to delete brand logo');
        }
    };

    return (
        <div className="space-y-8">
            {/* Add New Brand Section */}
            <Card className="p-6">
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    Add New Brand Partner
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="e.g. GoPro"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Website Link (Optional)
                            </label>
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="https://gopro.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Brand Logo *
                        </label>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setUseImageUrl(false)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!useImageUrl ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                Upload File
                            </button>
                            <button
                                type="button"
                                onClick={() => setUseImageUrl(true)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${useImageUrl ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                Image URL
                            </button>
                        </div>

                        {!useImageUrl ? (
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Choose File
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                {uploadedImage && <span className="text-sm text-gray-500">{uploadedImage.name}</span>}
                            </div>
                        ) : (
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => {
                                    setImageUrl(e.target.value);
                                    setUploadedImage(null);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="https://example.com/logo.png"
                            />
                        )}

                        {/* Preview */}
                        {(uploadedImage || (useImageUrl && imageUrl)) && (
                            <div className="mt-2 text-sm text-gray-500">
                                <p className="mb-1">Preview:</p>
                                <img src={imageUrl} alt="Preview" className="h-16 w-auto object-contain bg-gray-50 rounded border p-2" />
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isAdding}>
                        {isAdding ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add Brand Partner
                    </Button>
                </form>
            </Card>

            {/* Existing Brands List */}
            <div>
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    Current Partners
                </h3>

                {isLoading ? (
                    <div className="text-center py-8">
                        <Loader className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : brands.length === 0 ? (
                    <p className="text-gray-500 italic">No brand partners added yet.</p>
                ) : (
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                        {brands.map((brand) => (
                            <Card key={brand.id} className="relative p-4 group hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-3">
                                <div className="h-20 w-full flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <img
                                        src={brand.image_url}
                                        alt={brand.title}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                                <div className="text-center w-full">
                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={brand.title}>
                                        {brand.title}
                                    </h4>
                                    {brand.link_url && brand.link_url !== '#' && (
                                        <a href={brand.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center justify-center gap-1 mt-1">
                                            <LinkIcon className="h-3 w-3" /> Visit
                                        </a>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleDelete(brand.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                                    title="Remove"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
