import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { blogPosts } from "@db/schema";

export const blogRouter = createRouter({
  // List blog posts (public)
  list: publicQuery
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit, status } = { page: 1, limit: 10, ...input };

      const where = status ? eq(blogPosts.status, status) : eq(blogPosts.status, "published");

      const items = await db.query.blogPosts.findMany({
        where,
        orderBy: [desc(blogPosts.createdAt)],
        limit,
        offset: (page - 1) * limit,
      });

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(where);
      const total = countResult[0]?.count ?? 0;

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  // Get single post by slug (public)
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const post = await db.query.blogPosts.findFirst({
        where: eq(blogPosts.slug, input.slug),
      });
      return post ?? null;
    }),

  // Create blog post (admin)
  create: adminQuery
    .input(z.object({
      title: z.string().min(1).max(255),
      slug: z.string().min(1).max(255),
      content: z.string().min(1),
      metaDescription: z.string().max(300).optional(),
      keywords: z.array(z.string()).optional(),
      seoScore: z.number().optional(),
      status: z.enum(["draft", "published", "archived"]).default("published"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(blogPosts).values({
        title: input.title,
        slug: input.slug,
        content: input.content,
        metaDescription: input.metaDescription ?? null,
        keywords: input.keywords ?? null,
        seoScore: input.seoScore ?? null,
        status: input.status,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update blog post (admin)
  update: adminQuery
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      slug: z.string().min(1).max(255).optional(),
      content: z.string().min(1).optional(),
      metaDescription: z.string().max(300).optional(),
      keywords: z.array(z.string()).optional(),
      seoScore: z.number().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id));
      return { success: true };
    }),

  // Delete blog post (admin)
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),
});
