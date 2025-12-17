import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { galleryApi, GalleryImage } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await galleryApi.getAll();
      setImages(data || []);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['All', ...new Set(images.map(img => img.category))];

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-28">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-4 font-['Inter'] text-5xl font-bold text-white md:text-6xl">
              Photo Gallery
            </h1>
            <p className="font-['Merriweather'] text-xl text-emerald-100">
              A collection of moments from my travels around the world
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 flex flex-wrap justify-center gap-3"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-6 py-3 font-['Inter'] font-medium transition-all ${selectedCategory === category
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          </div>
        ) : filteredImages.length === 0 ? (
          <p className="text-center py-20 text-gray-500">No images found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900"
              >
                <div className="aspect-square">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="mb-1 font-['Inter'] font-bold text-white">
                      {image.title}
                    </h3>
                    {image.location && (
                      <p className="mb-2 font-['Merriweather'] text-sm text-white/80">
                        {image.location}
                      </p>
                    )}
                    {image.caption && (
                      <p className="text-xs text-white/70 line-clamp-2">
                        {image.caption}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-end">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur-sm">
                        {image.category}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
