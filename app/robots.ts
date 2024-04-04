import { MetadataRoute } from "next"
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/contact", "/privacy-policy", "/terms-of-service"],
      },
    ],
    sitemap: "https://gifmagic.app/sitemap.xml",
  }
}
