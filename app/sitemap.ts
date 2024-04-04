import { MetadataRoute } from "next"
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://gifmagic.app",
      changeFrequency: "daily",
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://gifmagic.app/video-to-gif",
      changeFrequency: "daily",
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://gifmagic.app/video-to-gif/converter-and-editor",
      changeFrequency: "daily",
      priority: 0.5,
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://gifmagic.app/screen-to-video",
      changeFrequency: "daily",
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://gifmagic.app/screen-to-video/record-screen",
      changeFrequency: "daily",
      priority: 0.5,
      lastModified: new Date().toISOString(),
    },
  ]
}
