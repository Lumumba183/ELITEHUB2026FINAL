import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://elitehub.co.ke";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/browse", "/login", "/register"],
        disallow: ["/dashboard", "/admin", "/api", "/wallet", "/messages", "/profile"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/blog", "/browse"],
        disallow: ["/dashboard", "/admin", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
