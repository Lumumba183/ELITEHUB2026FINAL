import { Link } from "react-router";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function Blog() {
  const { data, isLoading } = trpc.blog.list.useQuery({ limit: 12 });

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#F5E6D3]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Home
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-[#F5E6D3]" style={{ fontFamily: "'Playfair Display', serif" }}>
            EliteHub Blog
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold text-[#F5E6D3] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Insights & Stories
          </h1>
          <p className="text-[#9CA3AF] max-w-lg mx-auto">
            Expert advice, industry trends, and success stories from the EliteHub community
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass glass-border rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-[#1E1E2D]" />
                <div className="p-5 space-y-3">
                  <div className="w-3/4 h-5 bg-[#1E1E2D] rounded" />
                  <div className="w-full h-3 bg-[#1E1E2D] rounded" />
                  <div className="w-2/3 h-3 bg-[#1E1E2D] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items.map((post, i) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <article className="glass glass-border rounded-xl overflow-hidden hover:border-[#E11D48]/20 transition-all group h-full flex flex-col">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`/assets/blog-cover-${(i % 3) + 1}.jpg`}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-[#F5E6D3] mb-2 group-hover:text-[#E11D48] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[#9CA3AF] line-clamp-2 mb-4 flex-1">
                      {post.metaDescription}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      {post.seoScore && (
                        <span className="flex items-center gap-1 text-[#10B981]">
                          <Tag className="w-3 h-3" />
                          SEO {post.seoScore}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {data?.items.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#9CA3AF]">No blog posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
