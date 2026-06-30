import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, stories, and updates from the world of premium companionship.",
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*, author:author_id(display_name)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            ELITEHUB <span className="text-gradient-crimson">Blog</span>
          </h1>
          <p className="text-[#A09B8C] max-w-2xl mx-auto">
            Insights, stories, and updates from the world of premium companionship
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-all group"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={post.cover_image || "/assets/blog-cover-1.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h2 className="font-semibold text-xl mb-2 group-hover:text-[#E11D48] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[#A09B8C] text-sm line-clamp-2 mb-4">
                    {post.excerpt || post.content.substring(0, 120) + "..."}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[#A09B8C]">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author?.display_name || "Admin"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : "Draft"}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-20">
              <p className="text-[#A09B8C]">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
