import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Save, Trash2, Upload, MapPin, Search, Loader } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { supabase, uploadFile, CountryInfo, CityInfo } from '../../../lib/supabase';
import { toast } from 'sonner';

export function LocationManager() {
    const [activeTab, setActiveTab] = useState('countries');
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState<CountryInfo[]>([]);
    const [cities, setCities] = useState<CityInfo[]>([]);

    // Form States
    const [countryForm, setCountryForm] = useState({
        country_name: '',
        description: '',
        image_url: '',
        imageFile: null as File | null
    });

    const [cityForm, setCityForm] = useState({
        city_name: '',
        country_name: '',
        description: '',
        image_url: '',
        imageFile: null as File | null
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            // Fetch Countries
            const { data: countriesData } = await supabase
                .from('country_playlists')
                .select('*')
                .order('country_name');

            if (countriesData) setCountries(countriesData);

            // Fetch Cities
            const { data: citiesData } = await supabase
                .from('city_playlists')
                .select('*')
                .order('city_name');

            if (citiesData) setCities(citiesData);

        } catch (error) {
            console.error('Error fetching locations:', error);
            toast.error('Failed to load location data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCountrySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!countryForm.country_name) return;

        setIsLoading(true);
        try {
            let imageUrl = countryForm.image_url;

            if (countryForm.imageFile) {
                const { url, error } = await uploadFile('LOCATIONS', countryForm.imageFile);
                if (error) throw error;
                imageUrl = url;
            }

            const { error } = await supabase
                .from('country_playlists')
                .upsert({
                    country_name: countryForm.country_name,
                    description: countryForm.description,
                    image_url: imageUrl
                });

            if (error) throw error;

            toast.success('Main Playlist (Country) saved successfully!');
            setCountryForm({ country_name: '', description: '', image_url: '', imageFile: null });
            fetchLocations();
        } catch (error) {
            console.error('Error saving country:', error);
            toast.error('Failed to save country');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cityForm.city_name || !cityForm.country_name) {
            toast.error('City Name and Parent Country are required');
            return;
        }

        setIsLoading(true);
        try {
            let imageUrl = cityForm.image_url;

            if (cityForm.imageFile) {
                const { url, error } = await uploadFile('LOCATIONS', cityForm.imageFile);
                if (error) throw error;
                imageUrl = url;
            }

            const { error } = await supabase
                .from('city_playlists')
                .upsert({
                    city_name: cityForm.city_name,
                    country_name: cityForm.country_name,
                    description: cityForm.description,
                    image_url: imageUrl
                });

            if (error) throw error;

            toast.success('Sub Playlist (City) saved successfully!');
            setCityForm({ city_name: '', country_name: '', description: '', image_url: '', imageFile: null });
            fetchLocations();
        } catch (error) {
            console.error('Error saving city:', error);
            toast.error('Failed to save city');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteLocation = async (table: 'country_playlists' | 'city_playlists', idColumn: string, idValue: string) => {
        if (!confirm('Are you sure you want to delete this playlist?')) return;

        try {
            const { error } = await supabase.from(table).delete().eq(idColumn, idValue);
            if (error) throw error;
            toast.success('Deleted successfully');
            fetchLocations();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Manage Playlists (Locations)
                </h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="countries">Main Playlists (Countries)</TabsTrigger>
                    <TabsTrigger value="cities">Sub Playlists (Cities)</TabsTrigger>
                </TabsList>

                {/* COUNTRIES TAB (Main Playlists) */}
                <TabsContent value="countries" className="space-y-6">
                    <Card className="p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Add New Country</h2>
                        <form onSubmit={handleCountrySubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Country Name (Unique ID)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={countryForm.country_name}
                                        onChange={(e) => setCountryForm({ ...countryForm, country_name: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
                                        placeholder="e.g. Thailand"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Playlist Thumbnail
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setCountryForm({ ...countryForm, imageFile: e.target.files[0] });
                                            }
                                        }}
                                        className="w-full text-sm text-gray-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">OR Paste URL</p>
                                    <input
                                        type="text"
                                        value={countryForm.image_url}
                                        onChange={(e) => setCountryForm({ ...countryForm, image_url: e.target.value })}
                                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    value={countryForm.description}
                                    onChange={(e) => setCountryForm({ ...countryForm, description: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
                                    rows={2}
                                    placeholder="Short description for the card..."
                                />
                            </div>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                                {isLoading ? <Loader className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Save Country Playlist
                            </Button>
                        </form>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {countries.map((country) => (
                            <Card key={country.country_name} className="overflow-hidden">
                                <div className="relative h-40 w-full">
                                    <img
                                        src={country.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                                        alt={country.country_name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => deleteLocation('country_playlists', 'country_name', country.country_name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg">{country.country_name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">{country.description}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* CITIES TAB (Sub Playlists) */}
                <TabsContent value="cities" className="space-y-6">
                    <Card className="p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Add New City</h2>
                        <form onSubmit={handleCitySubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Parent Country
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={cityForm.country_name}
                                        onChange={(e) => setCityForm({ ...cityForm, country_name: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
                                        placeholder="e.g. Pakistan"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Must match an existing country playlist name</p>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        City Name (Unique ID)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={cityForm.city_name}
                                        onChange={(e) => setCityForm({ ...cityForm, city_name: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
                                        placeholder="e.g. Bangkok"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Cover Image (Thumbnail)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setCityForm({ ...cityForm, imageFile: e.target.files[0] });
                                            }
                                        }}
                                        className="w-full text-sm text-gray-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">OR Paste URL</p>
                                    <input
                                        type="text"
                                        value={cityForm.image_url}
                                        onChange={(e) => setCityForm({ ...cityForm, image_url: e.target.value })}
                                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    value={cityForm.description}
                                    onChange={(e) => setCityForm({ ...cityForm, description: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
                                    rows={2}
                                    placeholder="Short description..."
                                />
                            </div>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                                {isLoading ? <Loader className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Save City Playlist
                            </Button>
                        </form>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cities.map((city) => (
                            <Card key={city.city_name} className="overflow-hidden">
                                <div className="relative h-40 w-full">
                                    <img
                                        src={city.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                                        alt={city.city_name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <span className="rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                                            {city.country_name}
                                        </span>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => deleteLocation('city_playlists', 'city_name', city.city_name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg">{city.city_name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">{city.description}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
