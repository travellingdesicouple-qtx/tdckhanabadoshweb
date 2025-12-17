import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase, Adventure } from '../../lib/supabase';

export function Adventures() {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdventures() {
      try {
        // Fetch featured adventures or latest ones
        const { data, error } = await supabase
          .from('adventures')
          .select('*')
          .eq('published', true)
          // We can add .eq('featured', true) if we have a featured flag, 
          // but based on types we don't seem to have one explicit 'featured' flag in interface 
          // defined in supabase.ts, but user might add it. 
          // For now, let's just fetch latest 4 adventures.
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        if (data) setAdventures(data);
      } catch (error) {
        console.error('Error fetching adventures:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdventures();
  }, []);

  if (loading) {
    return (
      <section id="adventures" className="bg-white py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          Loading adventures...
        </div>
      </section>
    );
  }

  // If no adventures, show nothing or placeholder
  if (adventures.length === 0) {
    return (
      <section id="adventures" className="bg-white py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-gray-500 font-['Merriweather']">
          <p>Adventures coming soon...</p>
        </div>
      </section>
    );
  }

  const featuredPost = adventures[0];
  const otherPosts = adventures.slice(1, 4);

  return (
    <section id="adventures" className="bg-white py-20 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 font-['Inter'] text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Popular Adventures
          </h2>
          <p className="font-['Merriweather'] text-xl text-gray-600 dark:text-gray-300">
            Featured stories from the road and photography guides
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Large Featured Post */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-800"
          >
            <div className="grid lg:grid-cols-2">
              {/* Large Image */}
              <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
                <img
                  src={featuredPost.cover_image}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 backdrop-blur-sm dark:bg-gray-900/90 dark:text-white">
                  {featuredPost.category}
                </div>
                {/* Removed 'Featured' badge since we are just sorting by latest for now */}
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <h3 className="mb-4 font-['Inter'] text-3xl font-bold leading-tight text-gray-900 transition-colors duration-300 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 lg:text-4xl">
                  <a href={`#${featuredPost.slug}`}>{featuredPost.title}</a>
                </h3>

                <p className="mb-6 font-['Merriweather'] text-lg text-gray-600 dark:text-gray-300">
                  {featuredPost.description}
                </p>

                {/* Meta Information */}
                <div className="mb-6 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {featuredPost.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{featuredPost.duration}</span>
                    </div>
                  )}
                </div>

                {/* Read More Button */}
                <a
                  href={`#${featuredPost.slug}`}
                  className="group/btn inline-flex w-fit items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-['Inter'] font-semibold text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg"
                >
                  Read Full Story
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </a>
              </div>
            </div>
          </motion.article>

          {/* Three Smaller Posts Grid */}
          {otherPosts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              {otherPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800"
                >
                  {/* Image */}
                  <div className="relative h-[240px] overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur-sm dark:bg-gray-900/90 dark:text-white">
                      {post.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="mb-3 font-['Inter'] text-xl font-bold leading-tight text-gray-900 transition-colors duration-300 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                      <a href={`#${post.slug}`}>{post.title}</a>
                    </h3>

                    <p className="mb-4 line-clamp-2 font-['Merriweather'] text-sm text-gray-600 dark:text-gray-300">
                      {post.description}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center gap-3 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      {post.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Read More Link */}
                    <a
                      href={`#${post.slug}`}
                      className="mt-3 inline-block font-['Inter'] text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      Read More →
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>

        {/* View All Adventures CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <a
            href="#all-adventures"
            className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-600 bg-transparent px-8 py-4 font-['Inter'] font-semibold text-emerald-600 transition-all duration-300 hover:scale-105 hover:bg-emerald-600 hover:text-white dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-400 dark:hover:text-gray-900"
          >
            View All Adventures
            <ArrowRight className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}