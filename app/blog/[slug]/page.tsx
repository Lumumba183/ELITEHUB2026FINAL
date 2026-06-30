import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, User } from "lucide-react";

export const dynamic = 'force-dynamic';

interface BlogPageProps {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, author:author_id(display_name)")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[#A09B8C] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
          <Image
            src={post.cover_image || "/assets/blog-cover-1.jpg"}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
        </div>

        <div className="flex items-center gap-4 text-sm text-[#A09B8C] mb-6">
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

        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">
          {post.title}
        </h1>

        <div className="prose prose-invert prose-lg max-w-none text-[#F5E6D3]">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </div>
  );
}
