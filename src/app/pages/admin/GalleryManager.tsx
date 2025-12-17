import { useState, useEffect } from 'react';
import { Plus, Trash2, Star, StarOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { galleryApi, uploadFile, deleteFile, GalleryImage } from '../../../lib/supabase';

export default function GalleryManager() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [newImage, setNewImage] = useState({
        title: '',
        caption: '',
        location: '',
        category: 'Landscape',
        featured: false,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [inputUrl, setInputUrl] = useState('');

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const data = await galleryApi.getAll();
            setImages(data || []);
        } catch (error) {
            console.error('Error loading gallery images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile && !inputUrl) return alert('Please select an image file or enter an image URL');

        setIsUploading(true);
        try {
            let finalImageUrl = inputUrl;

            // 1. Upload Image (if file selected)
            if (imageFile) {
                const { url, error: uploadError } = await uploadFile('GALLERY', imageFile);
                if (uploadError) throw uploadError;
                finalImageUrl = url;
            }

            // 2. Save Metadata
            const imageData = {
                title: newImage.title,
                caption: newImage.caption || null,
                location: newImage.location || null,
                category: newImage.category,
                featured: newImage.featured,
                image_url: finalImageUrl
            };

            await galleryApi.create(imageData);

            // Reset Form & Reload
            setNewImage({ title: '', caption: '', location: '', category: 'Landscape', featured: false });
            setImageFile(null);
            setInputUrl('');
            loadImages();
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const toggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            await galleryApi.update(id, { featured: !currentStatus });
            setImages(images.map(img => img.id === id ? { ...img, featured: !currentStatus } : img));
        } catch (error) {
            console.error('Toggle featured failed:', error);
            alert('Failed to update featured status');
        }
    };

    const handleDelete = async (id: string, imageUrl: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            // Extract path from URL
            const path = imageUrl.split('/content-images/')[1];
            if (path) {
                await deleteFile('GALLERY', path);
            }

            await galleryApi.delete(id);
            setImages(images.filter(img => img.id !== id));
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete image');
        }
    };

    return (
        <div className="space-y-8">
            <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Upload New Image</h3>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input
                                value={newImage.title}
                                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                                required
                                placeholder="e.g. Sunset at Hunza Valley"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                value={newImage.location}
                                onChange={(e) => setNewImage({ ...newImage, location: e.target.value })}
                                placeholder="e.g. Hunza Valley, Pakistan"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={newImage.category}
                                onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                            >
                                <option>Landscape</option>
                                <option>Portrait</option>
                                <option>Wildlife</option>
                                <option>Street</option>
                                <option>Architecture</option>
                                <option>Culture</option>
                                <option>Food</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="space-y-2 flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newImage.featured}
                                    onChange={(e) => setNewImage({ ...newImage, featured: e.target.checked })}
                                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium">Show on Landing Page (Featured)</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Caption</Label>
                        <Textarea
                            value={newImage.caption}
                            onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                            placeholder="Add a description or story about this image..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                        <Label>Image Source</Label>

                        <div className="space-y-2">
                            <Label className="text-xs text-gray-500">Option A: Upload File</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="bg-white dark:bg-gray-900"
                            />
                        </div>

                        <div className="relative flex items-center justify-center">
                            <hr className="w-full border-gray-200 dark:border-gray-700" />
                            <span className="absolute bg-gray-50 px-2 text-xs text-gray-500 dark:bg-gray-800">OR</span>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-gray-500">Option B: Image URL</Label>
                            <Input
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="bg-white dark:bg-gray-900"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={isUploading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Upload Image
                    </Button>
                </form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p>Loading gallery...</p>
                ) : images.length === 0 ? (
                    <p className="text-gray-500">No images uploaded yet.</p>
                ) : (
                    images.map((image) => (
                        <Card key={image.id} className="overflow-hidden group">
                            <div className="relative aspect-square">
                                <img
                                    src={image.image_url}
                                    alt={image.title}
                                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => toggleFeatured(image.id, image.featured)}
                                    >
                                        {image.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(image.id, image.image_url)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                {image.featured && (
                                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-current" />
                                        Featured
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold truncate">{image.title}</h4>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{image.category}</span>
                                </div>
                                {image.location && (
                                    <p className="text-sm text-gray-500 mb-2">{image.location}</p>
                                )}
                                {image.caption && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{image.caption}</p>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
