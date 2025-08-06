import { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://gif-creator.heinerdevelops.tech',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://gif-creator.heinerdevelops.tech/video-to-gif',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://gif-creator.heinerdevelops.tech/video-to-gif/converter-and-editor',
      changeFrequency: 'daily',
      priority: 0.5,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://gif-creator.heinerdevelops.tech/image-to-gif',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://gif-creator.heinerdevelops.tech/image-to-gif/converter-and-editor',
      changeFrequency: 'daily',
      priority: 0.5,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://gif-creator.heinerdevelops.tech/create-and-edit-gifs',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://gif-creator.heinerdevelops.tech/create-and-edit-gifs/converter-and-editor',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://gif-creator.heinerdevelops.tech/create-and-edit-gifs/converter-and-editor/editor',
      
    },

    {
      url: 'https://gif-creator.heinerdevelops.tech/screen-to-video',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://gif-creator.heinerdevelops.tech/screen-to-video/record-screen',
      changeFrequency: 'daily',
      priority: 0.5,
      lastModified: new Date().toISOString(),
    },
  ];
}
