import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Play, Loader } from 'lucide-react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from './ui/carousel';
import { supabase } from '../../lib/supabase';

interface CityPlaylist {
    city_name: string;
    country_name: string;
    image_url: string;
    description: string;
    vlogCount: number;
}

export function CityPlaylists() {
    const [playlists, setPlaylists] = useState<CityPlaylist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            // Fetch cities
            const { data: cities, error: citiesError } = await supabase
                .from('city_playlists')
                .select('*');

            if (citiesError) throw citiesError;

            // Fetch adventure counts per city
            const { data: adventures, error: adventuresError } = await supabase
                .from('adventures')
                .select('city')
                .eq('published', true);

            if (adventuresError) throw adventuresError;

            const counts: Record<string, number> = {};
            adventures?.forEach(adv => {
                if (adv.city) {
                    counts[adv.city] = (counts[adv.city] || 0) + 1;
                }
            });

            const formattedPlaylists = cities?.map(city => ({
                city_name: city.city_name,
                country_name: city.country_name,
                image_url: city.image_url,
                description: city.description,
                vlogCount: counts[city.city_name] || 0
            })) || [];

            setPlaylists(formattedPlaylists);
        } catch (error) {
            console.error('Error fetching city playlists:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="py-20 text-center"><Loader className="mx-auto h-8 w-8 animate-spin text-emerald-600" /></div>;
    }

    return (
        <section className="bg-white py-20 dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <h2 className="mb-4 font-['Inter'] text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
                        Explore by City
                    </h2>
                    <p className="font-['Merriweather'] text-xl text-gray-600 dark:text-gray-300">
                        Dive deep into the culture and vibes of each city
                    </p>
                </motion.div>

                {playlists.length === 0 ? (
                    <div className="text-center text-gray-500">No city playlists found directly. Add them in Admin Panel!</div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Carousel
                            opts={{
                                align: 'start',
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {playlists.map((playlist) => (
                                    <CarouselItem key={playlist.city_name} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                        <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
                                            {/* City Image */}
                                            <div className="relative h-[320px] overflow-hidden">
                                                <img
                                                    src={playlist.image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
                                                    alt={playlist.city_name}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />

                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                                                {/* Country Badge */}
                                                <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-md">
                                                    {playlist.country_name}
                                                </div>

                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <div className="rounded-full bg-white/30 p-6 backdrop-blur-sm">
                                                        <Play className="h-12 w-12 fill-white text-white" />
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <MapPin className="h-5 w-5 text-white" />
                                                        <h3 className="font-['Inter'] text-2xl font-bold text-white">
                                                            {playlist.city_name}
                                                        </h3>
                                                    </div>

                                                    <p className="mb-3 font-['Merriweather'] text-sm text-white/90">
                                                        {playlist.description}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <span className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">
                                                            {playlist.vlogCount} Vlogs
                                                        </span>

                                                        <button className="group/btn flex items-center gap-2 font-['Inter'] text-sm font-semibold text-white transition-all duration-300 hover:gap-3">
                                                            Watch All
                                                            <Play className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>

                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                        </Carousel>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
