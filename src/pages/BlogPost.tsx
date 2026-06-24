import { Link, useParams } from "react-router";
import { ArrowLeft, Clock, Tag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug: slug ?? "" });

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog">
            <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#F5E6D3]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="w-3/4 h-8 bg-[#1E1E2D] rounded" />
            <div className="w-1/2 h-4 bg-[#1E1E2D] rounded" />
            <div className="h-64 bg-[#1E1E2D] rounded" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-[#1E1E2D] rounded" />
              <div className="w-full h-4 bg-[#1E1E2D] rounded" />
              <div className="w-2/3 h-4 bg-[#1E1E2D] rounded" />
            </div>
          </div>
        ) : post ? (
          <article>
            <div className="h-64 rounded-xl overflow-hidden mb-8">
              <img
                src="/assets/blog-cover-1.jpg"
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold text-[#F5E6D3] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {post.title}
            </h1>

            <div className="flex items-center gap-4 mb-8 text-sm text-[#9CA3AF]">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              {post.seoScore && (
                <span className="flex items-center gap-1 text-[#10B981]">
                  <Tag className="w-4 h-4" />
                  SEO Score: {post.seoScore}
                </span>
              )}
              <button className="flex items-center gap-1 hover:text-[#F5E6D3] transition-colors ml-auto">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {post.metaDescription && (
              <p className="text-lg text-[#9CA3AF] italic mb-8 border-l-2 border-[#E11D48] pl-4">
                {post.metaDescription}
              </p>
            )}

            <div
              className="prose prose-invert max-w-none prose-headings:text-[#F5E6D3] prose-p:text-[#9CA3AF] prose-a:text-[#E11D48] prose-strong:text-[#F5E6D3]"
              dangerouslySetInnerHTML={{ __html: String(post.content) }}
            />

            {post.keywords ? (
              <div className="mt-10 pt-6 border-t border-white/5">
                <p className="text-sm text-[#9CA3AF] mb-3">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {(typeof post.keywords === "string" ? JSON.parse(post.keywords) : post.keywords as string[]).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-[#E11D48]/10 text-[#E11D48] text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#9CA3AF] text-lg">Blog post not found</p>
            <Link to="/blog" className="text-[#E11D48] hover:text-[#FB7185] text-sm mt-2 inline-block">
              Back to Blog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
