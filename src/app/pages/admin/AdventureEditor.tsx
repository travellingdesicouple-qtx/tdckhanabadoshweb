import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Upload, Video, Youtube, MapPin, Loader } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { adventuresApi } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export function AdventureEditor() {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Adventure',
    description: '',
    coverImage: '',
    youtubeVideoId: '',
    duration: '',
    difficulty: 'Moderate' as 'Easy' | 'Moderate' | 'Challenging' | 'Extreme',
    contentImages: [] as string[],
    playlist: '',
    country: '',
    city: '',
    licenseType: 'owned' as 'owned' | 'unsplash' | 'pexels' | 'pixabay' | 'cc0' | 'cc-by' | 'commercial',
    photographerName: '',
    sourceUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions = [
    'Budget Travel',
    'Luxury Travel',
    'Food Travel',
    'Adventure Travel',
    'Family Travel',
    'Solo Travel',
    'Cultural / Heritage Travel',
    'Religious / Spiritual Travel',
    'Road Trips',
    'Van Life / Nomad Travel',
    'Travel Guides / How-to',
    'Hidden & Underrated Places',
  ];

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [contentImageFiles, setContentImageFiles] = useState<File[]>([]);
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'contentImages') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'cover') {
      setUploadedImage(files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result as string });
      };
      reader.readAsDataURL(files[0]);
    } else {
      // Limit to 4 images total
      const remainingSlots = 4 - formData.contentImages.length;
      if (remainingSlots <= 0) {
        alert('Maximum 4 content images allowed!');
        return;
      }

      const newImages = Array.from(files).slice(0, remainingSlots);
      setContentImageFiles([...contentImageFiles, ...newImages]);

      // Create preview URLs
      newImages.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            contentImages: [...prev.contentImages, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const [countries, setCountries] = useState<{ country_name: string }[]>([]);
  const [cities, setCities] = useState<{ city_name: string, country_name: string }[]>([]);
  const [filteredCities, setFilteredCities] = useState<{ city_name: string }[]>([]);

  React.useEffect(() => {
    const fetchLocations = async () => {
      const { data: countriesData } = await supabase.from('country_playlists').select('country_name').order('country_name');
      const { data: citiesData } = await supabase.from('city_playlists').select('city_name, country_name').order('city_name');

      if (countriesData) setCountries(countriesData);
      if (citiesData) setCities(citiesData);
    };
    fetchLocations();
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setFormData({ ...formData, country, city: '' });

    if (country) {
      const filtered = cities.filter(c => c.country_name === country);
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, city: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedImage && !imageUrl) {
      toast.error('Please provide a cover image');
      return;
    }

    if (!formData.youtubeVideoId) {
      toast.error('YouTube Video ID is required');
      return;
    }

    setIsLoading(true);

    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const adventureData = {
        title: formData.title,
        slug,
        location: formData.location,
        description: formData.description,
        cover_image: '', // Will be set by API
        category: formData.category,
        youtube_video_id: formData.youtubeVideoId,
        duration: formData.duration || null,
        difficulty: formData.difficulty,
        country: formData.country || null,
        city: formData.city || null,
        published: true,
      };

      const { data, error } = await adventuresApi.create(adventureData as any, useImageUrl ? imageUrl : uploadedImage!);

      if (error) throw error;

      toast.success('Adventure published successfully!');
      setTimeout(() => {
        window.location.hash = 'adminpanel';
      }, 1500);
    } catch (error) {
      console.error('Error creating adventure:', error);
      toast.error('Failed to publish adventure. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => window.location.hash = 'adminpanel'} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add New Adventure
            </h1>
          </div>
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Publish Adventure
              </>
            )}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Playlist & Location Details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Main Playlist (Country)
                </label>
                <select
                  value={formData.country}
                  onChange={handleCountryChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select Country...</option>
                  {countries.map(c => (
                    <option key={c.country_name} value={c.country_name}>{c.country_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Sub Playlist (City)
                </label>
                <select
                  value={formData.city}
                  onChange={handleCityChange}
                  disabled={!formData.country}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                >
                  <option value="">Select City...</option>
                  {filteredCities.map(c => (
                    <option key={c.city_name} value={c.city_name}>{c.city_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Adventure Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Adventure Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Hiking Nanga Parbat Base Camp"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., Fairy Meadows"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <div className="flex gap-2">
                  {formData.category === 'new' || ![
                    'Budget Travel',
                    'Luxury Travel',
                    'Food Travel',
                    'Adventure Travel',
                    'Family Travel',
                    'Solo Travel',
                    'Cultural / Heritage Travel',
                    'Religious / Spiritual Travel',
                    'Road Trips',
                    'Van Life / Nomad Travel',
                    'Travel Guides / How-to',
                    'Hidden & Underrated Places'
                  ].includes(formData.category) && formData.category !== '' ? (
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={formData.category === 'new' ? '' : formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Type new category..."
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, category: 'Adventure Travel' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === 'new_custom_val') {
                          setFormData({ ...formData, category: 'new' }); // Set to 'new' to trigger input mode
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="new_custom_val" className="font-bold text-emerald-600">+ Add New Category</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </Card>


          <Card className="p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Location & Details
            </h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., Gilgit-Baltistan, Pakistan"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option>Adventure</option>
                    <option>Food</option>
                    <option>Culture</option>
                    <option>Travel Tips</option>
                    <option>Photography</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., 5 days"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description / Content
                </label>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  Use the toolbar to format your content. You can add headings, bold, italic, lists, links, etc.
                </p>
                <div className="rounded-lg border border-gray-300 dark:border-gray-700">
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                    formats={[
                      'header',
                      'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet',
                      'color', 'background',
                      'align',
                      'link'
                    ]}
                    placeholder="Describe your adventure experience..."
                    className="bg-white dark:bg-gray-800"
                    style={{ minHeight: '250px' }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Cover Image (Thumbnail)
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4 justify-center">
                <button
                  type="button"
                  onClick={() => setUseImageUrl(false)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!useImageUrl ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setUseImageUrl(true)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${useImageUrl ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Image Link
                </button>
              </div>

              {!useImageUrl ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                  <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <label className="cursor-pointer">
                    <span className="text-emerald-600 hover:underline">Upload cover image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setFormData({ ...formData, coverImage: e.target.value });
                    }}
                    placeholder="Paste image URL here (e.g., https://example.com/image.jpg)"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}

              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="h-64 w-full rounded-lg object-cover"
                />
              )}
            </div>
          </Card>

          {/* Content Images */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Content Images (Max 4)
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              These images will appear between content sections in the adventure post.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <label className="cursor-pointer">
                  <span className="text-emerald-600 hover:underline">Upload content images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, 'contentImages')}
                    className="hidden"
                    disabled={formData.contentImages.length >= 4}
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  {formData.contentImages.length}/4 images uploaded
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Or add image via URL..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value) {
                        if (formData.contentImages.length >= 4) {
                          alert('Maximum 4 content images allowed!');
                          return;
                        }
                        setFormData(prev => ({
                          ...prev,
                          contentImages: [...prev.contentImages, input.value]
                        }));
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input.value) {
                      if (formData.contentImages.length >= 4) {
                        alert('Maximum 4 content images allowed!');
                        return;
                      }
                      setFormData(prev => ({
                        ...prev,
                        contentImages: [...prev.contentImages, input.value]
                      }));
                      input.value = '';
                    }
                  }}
                  variant="outline"
                >
                  Add URL
                </Button>
              </div>

              {formData.contentImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.contentImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Content ${idx + 1}`}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Youtube className="h-5 w-5 text-red-600" />
              YouTube Video (Will appear at the end)
            </h2>

            <input
              type="text"
              required
              value={formData.youtubeVideoId}
              onChange={(e) => setFormData({ ...formData, youtubeVideoId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="YouTube Video ID (e.g., dQw4w9WgXcQ)"
            />

            {formData.youtubeVideoId && (
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${formData.youtubeVideoId}`}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.hash = 'adminpanel'}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Publish Adventure
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
