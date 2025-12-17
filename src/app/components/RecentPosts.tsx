import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase, Blog } from '../../lib/supabase';

export function RecentPosts() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        if (data) setPosts(data);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section id="recent-posts" className="bg-gray-50 py-20 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          Loading recent adventures...
        </div>
      </section>
    );
  }

  // If no posts, don't show the section or show a placeholder message?
  // Let's show nothing if no posts found to avoid empty layout
  if (posts.length === 0) {
    return (
      <section id="recent-posts" className="bg-gray-50 py-20 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 font-['Merriweather']">New adventures coming soon...</p>
        </div>
      </section>
    );
  }

  const latestPost = posts[0];
  const recentPosts = posts.slice(1, 4);

  return (
    <section id="recent-posts" className="bg-gray-50 py-20 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 font-['Inter'] text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Recent Posts
          </h2>
          <p className="font-['Merriweather'] text-xl text-gray-600 dark:text-gray-300">
            Latest stories and adventures from the road
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Large Featured Recent Post */}
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
                  src={latestPost.cover_image}
                  alt={latestPost.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 backdrop-blur-sm dark:bg-gray-900/90 dark:text-white">
                  {latestPost.category}
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">
                  Latest
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <h3 className="mb-4 font-['Inter'] text-3xl font-bold leading-tight text-gray-900 transition-colors duration-300 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 lg:text-4xl">
                  <a href={`#${latestPost.slug}`}>{latestPost.title}</a>
                </h3>

                <p className="mb-6 font-['Merriweather'] text-lg text-gray-600 dark:text-gray-300">
                  {latestPost.excerpt}
                </p>

                {/* Meta Information */}
                <div className="mb-6 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(latestPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {latestPost.read_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{latestPost.read_time}</span>
                    </div>
                  )}
                </div>

                {/* Read More Button */}
                <a
                  href={`#${latestPost.slug}`}
                  className="group/btn inline-flex w-fit items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-['Inter'] font-semibold text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg"
                >
                  Read Full Story
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </a>
              </div>
            </div>
          </motion.article>

          {/* Three Smaller Recent Posts Grid */}
          {recentPosts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              {recentPosts.map((post, index) => (
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
                      {post.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center gap-3 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      {post.read_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.read_time}</span>
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
      </div>
    </section>
  );
}
