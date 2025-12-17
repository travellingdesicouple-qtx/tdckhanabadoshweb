import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Loader } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function WorldMap() {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVisitedCountries();
  }, []);

  const fetchVisitedCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('adventures')
        .select('country')
        .eq('published', true);

      if (error) throw error;

      const uniqueCountries = Array.from(new Set(data?.map(a => a.country).filter(Boolean) as string[]));
      setVisitedCountries(uniqueCountries);
    } catch (error) {
      console.error('Error fetching visited countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="map" className="bg-gray-50 py-20 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 font-['Inter'] text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Where I've Been
          </h2>
          <p className="font-['Merriweather'] text-xl text-gray-600 dark:text-gray-300">
            Explore the countries I've visited and the adventures I've had
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800"
        >
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                <Loader className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            )}
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 140,
              }}
              className="h-[500px] w-full md:h-[600px]"
            >
              <ZoomableGroup>
                <Geographies geography={geoUrl}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo) => {
                      // Check if country name is in our visited list
                      // geo.properties.name usually contains the Country Name
                      const isVisited = visitedCountries.some(vc =>
                        geo.properties.name.toLowerCase() === vc.toLowerCase() ||
                        geo.properties.name.toLowerCase().includes(vc.toLowerCase())
                      );

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={
                            isVisited
                              ? '#10b981'
                              : '#e5e7eb'
                          }
                          stroke="#ffffff"
                          strokeWidth={0.5}
                          style={{
                            default: {
                              outline: 'none',
                            },
                            hover: {
                              fill: isVisited ? '#059669' : '#d1d5db',
                              outline: 'none',
                              cursor: isVisited ? 'pointer' : 'default',
                            },
                            pressed: {
                              outline: 'none',
                            },
                          }}
                          onMouseEnter={() => {
                            if (isVisited) {
                              setHoveredCountry(geo.properties.name);
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredCountry(null);
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {/* Tooltip */}
            {hoveredCountry && (
              <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
                {hoveredCountry}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-sm bg-green-500"></div>
                <span className="font-['Inter'] text-gray-700 dark:text-gray-300">Visited Countries</span>
              </div>
              <div className="font-['Inter'] font-semibold text-gray-900 dark:text-white">
                {visitedCountries.length} Countries Explored
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
