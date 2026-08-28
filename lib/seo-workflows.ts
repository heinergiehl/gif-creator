import type { Metadata } from 'next';
import { getGifEditorIntentHref } from '@/lib/editor-intents';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';

export interface SeoWorkflowFaq {
  question: string;
  answer: string;
}

export interface SeoWorkflowStep {
  title: string;
  description: string;
}

export interface SeoWorkflowFeature {
  title: string;
  description: string;
}

export interface SeoWorkflowLink {
  href: string;
  label: string;
  description: string;
}

export interface SeoWorkflowPage {
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  keywords: string[];
  intro: string;
  primaryCta: SeoWorkflowLink;
  secondaryCta?: SeoWorkflowLink;
  features: SeoWorkflowFeature[];
  steps: SeoWorkflowStep[];
  faqs: SeoWorkflowFaq[];
  relatedLinks: SeoWorkflowLink[];
  relatedPostSlugs: string[];
}

export const seoWorkflowPages: SeoWorkflowPage[] = [
  {
    slug: 'resize-gif',
    path: '/resize-gif',
    title: 'Resize GIF Online',
    metaTitle: 'Resize GIF Online Free',
    description:
      'Resize animated GIFs online without installing software. Change GIF dimensions for Discord, Slack, Notion, email, and the web while keeping animation quality under control.',
    keywords: [
      'resize gif',
      'resize animated gif',
      'change gif dimensions',
      'resize gif online',
      'make gif smaller',
    ],
    intro:
      'Resize animated GIFs for chat apps, docs, websites, and social posts with a browser-based editor that keeps the full animation intact. Adjust dimensions, preserve legibility, and export a lighter file without a watermark.',
    primaryCta: {
      href: getGifEditorIntentHref('resize'),
      label: 'Resize a GIF now',
      description: 'Open the editor and change GIF dimensions immediately.',
    },
    secondaryCta: {
      href: '/blog/resize-a-gif-for-discord-slack-and-notion',
      label: 'Read resizing tips',
      description: 'See recommended GIF dimensions for common platforms.',
    },
    features: [
      {
        title: 'Resize for real platforms',
        description:
          'Prepare GIFs for Discord, Slack, Notion, email, help docs, and landing pages with dimensions that fit the destination.',
      },
      {
        title: 'Keep loops readable',
        description:
          'Adjust the canvas without losing the timing and motion that make the animation understandable.',
      },
      {
        title: 'Control size and weight',
        description:
          'Smaller dimensions usually mean smaller files, which helps your GIF load faster and rank better on performance-sensitive pages.',
      },
    ],
    steps: [
      {
        title: 'Upload the GIF you want to resize',
        description:
          'Start with an existing GIF or create one from video or images before opening the editor.',
      },
      {
        title: 'Set the new dimensions',
        description:
          'Choose the width and height that match your target platform, then preview the updated animation.',
      },
      {
        title: 'Export a lighter optimized GIF',
        description:
          'Download the resized file and reduce file weight further if the destination has strict upload limits.',
      },
    ],
    faqs: [
      {
        question: 'How do I resize a GIF without breaking the animation?',
        answer:
          'Use an editor that keeps every frame in sequence while changing the overall canvas size. That preserves the loop instead of flattening the GIF into a still image.',
      },
      {
        question: 'Will resizing a GIF reduce file size?',
        answer:
          'Usually yes. Smaller dimensions reduce the amount of data per frame, which often results in a smaller exported GIF and faster loading.',
      },
      {
        question: 'What size should a GIF be for Slack or Discord?',
        answer:
          'The best size depends on the use case, but smaller dimensions usually improve upload speed and playback. Test the GIF where it will actually be used.',
      },
    ],
    relatedLinks: [
      {
        href: '/compress-gif',
        label: 'Optimize GIF file size',
        description: 'Reduce file weight further after resizing.',
      },
      {
        href: '/crop-gif',
        label: 'Crop a GIF',
        description: 'Trim unused edges before or after resizing.',
      },
    ],
    relatedPostSlugs: [
      'resize-a-gif-for-discord-slack-and-notion',
      'best-gif-size-for-email-docs-and-social-media',
      'optimize-gif-size-without-losing-quality',
    ],
  },
  {
    slug: 'crop-gif',
    path: '/crop-gif',
    title: 'Crop GIF Online',
    metaTitle: 'Crop GIF Online Free',
    description:
      'Crop animated GIFs online to remove extra space, focus attention, and reduce file size. Trim the frame area without losing motion or adding a watermark.',
    keywords: ['crop gif', 'crop animated gif', 'trim gif', 'crop gif online', 'cut gif frame'],
    intro:
      'Crop animated GIFs to keep the viewer focused on the action that matters. Remove empty borders, highlight the important region, and export a cleaner animation for product demos, tutorials, and social posts.',
    primaryCta: {
      href: getGifEditorIntentHref('crop'),
      label: 'Crop a GIF now',
      description: 'Open the editor and crop your GIF directly in the browser.',
    },
    secondaryCta: {
      href: '/edit-gifs',
      label: 'Explore the full GIF editor',
      description: 'See the broader editing workflow for animated images.',
    },
    features: [
      {
        title: 'Focus the animation',
        description:
          'Cut away side panels, menus, or empty borders so the motion lands on the right detail.',
      },
      {
        title: 'Improve clarity in docs',
        description:
          'A tighter crop often makes tutorial GIFs easier to read inside documentation, changelogs, and release notes.',
      },
      {
        title: 'Reduce file size naturally',
        description:
          'Cropping unnecessary pixels lowers the amount of data rendered in every frame.',
      },
    ],
    steps: [
      {
        title: 'Open your GIF in the editor',
        description: 'Upload an existing GIF or create one from video or images first.',
      },
      {
        title: 'Select the area to keep',
        description:
          'Drag the crop bounds around the part of the animation your audience actually needs to see.',
      },
      {
        title: 'Preview and export',
        description:
          'Check playback to ensure the crop feels stable across the loop, then export the cleaned-up animation.',
      },
    ],
    faqs: [
      {
        question: 'Can I crop an animated GIF without turning it into a static image?',
        answer:
          'Yes. A GIF editor crops every frame consistently, so the result stays animated instead of flattening into a single still.',
      },
      {
        question: 'Does cropping help with GIF file size?',
        answer:
          'Often it does. Removing unused screen area lowers frame area and can make exports faster and lighter.',
      },
      {
        question: 'Should I crop before or after resizing?',
        answer:
          'Usually crop first to remove unnecessary pixels, then resize the remaining content to the final output dimensions.',
      },
    ],
    relatedLinks: [
      {
        href: '/resize-gif',
        label: 'Resize a GIF',
        description: 'Change overall dimensions after cropping the frame.',
      },
      {
        href: '/compress-gif',
        label: 'Optimize GIF size',
        description: 'Shrink the exported file further for web delivery.',
      },
    ],
    relatedPostSlugs: [
      'how-to-edit-a-gif-without-losing-quality',
      'best-gif-size-for-email-docs-and-social-media',
      'optimize-gif-size-without-losing-quality',
    ],
  },
  {
    slug: 'rotate-gif',
    path: '/rotate-gif',
    title: 'Rotate GIF Online',
    metaTitle: 'Rotate GIF Online Free',
    description:
      'Rotate animated GIFs online to fix orientation, flip motion, or match a new layout. Adjust the full animation in your browser and export a clean GIF without a watermark.',
    keywords: [
      'rotate gif',
      'flip gif',
      'rotate animated gif',
      'rotate gif online',
      'turn gif sideways',
    ],
    intro:
      'Rotate animated GIFs when the source clip is sideways, the layout changed, or you need a mirrored version for a cleaner visual story. Adjust the full loop in-browser and keep the animation intact from start to finish.',
    primaryCta: {
      href: getGifEditorIntentHref('rotate'),
      label: 'Rotate a GIF now',
      description: 'Open the editor and correct GIF orientation immediately.',
    },
    secondaryCta: {
      href: '/video-to-gif',
      label: 'Start from video instead',
      description: 'Convert and rotate a short clip before exporting the final animation.',
    },
    features: [
      {
        title: 'Fix incorrect orientation',
        description:
          'Correct screen recordings, phone clips, and exported animations that appear sideways or upside down.',
      },
      {
        title: 'Flip or mirror motion',
        description:
          'Reverse the visual direction of a loop to better fit layouts, UI demos, or social formats.',
      },
      {
        title: 'Keep the full sequence aligned',
        description:
          'Apply the same transformation across every frame so playback stays consistent.',
      },
    ],
    steps: [
      {
        title: 'Upload your GIF',
        description: 'Open the animation you want to correct or reframe.',
      },
      {
        title: 'Rotate or flip the canvas',
        description:
          'Choose the orientation that makes the motion easiest to understand in the final placement.',
      },
      {
        title: 'Export and share',
        description:
          'Download the corrected animation and reuse it in docs, product updates, or posts.',
      },
    ],
    faqs: [
      {
        question: 'Can I rotate a GIF by 90 degrees online?',
        answer:
          'Yes. A browser-based GIF editor can rotate the full animation without requiring desktop software.',
      },
      {
        question: 'Will rotation change the playback speed?',
        answer:
          'No. Rotation changes orientation, not timing, so the frame order and playback speed stay the same unless you edit them separately.',
      },
      {
        question: 'Can I flip a GIF horizontally or vertically?',
        answer:
          'Yes. Flipping is useful when a mirrored direction works better for the surrounding layout or story.',
      },
    ],
    relatedLinks: [
      {
        href: '/crop-gif',
        label: 'Crop a GIF',
        description: 'Tighten the frame after changing orientation.',
      },
      {
        href: '/add-text-to-gif',
        label: 'Add text to a GIF',
        description: 'Label the corrected animation with captions or callouts.',
      },
    ],
    relatedPostSlugs: [
      'how-to-edit-a-gif-without-losing-quality',
      'record-screen-and-turn-it-into-a-gif',
      'how-to-add-text-to-a-gif-without-cluttering-the-animation',
    ],
  },
  {
    slug: 'add-text-to-gif',
    path: '/add-text-to-gif',
    title: 'Add Text to GIF Online',
    metaTitle: 'Add Text to GIF Online — Animated GIF Captions',
    description:
      'Add captions, labels, and callouts to animated GIFs online. Place text without blocking the motion, then export a clean GIF without a watermark.',
    keywords: [
      'add text to gif',
      'gif caption maker',
      'put text on a gif',
      'add caption to gif online',
      'gif text editor',
    ],
    intro:
      'Add text to GIFs when you need captions, short callouts, tutorial labels, or reaction text. Keep the message readable without covering the motion that makes the animation work.',
    primaryCta: {
      href: getGifEditorIntentHref('add-text'),
      label: 'Add text to a GIF now',
      description: 'Open the editor and place text overlays on your animation.',
    },
    secondaryCta: {
      href: '/blog/how-to-add-text-to-a-gif-without-cluttering-the-animation',
      label: 'Read the text overlay guide',
      description: 'Learn how to keep captions readable without cluttering motion.',
    },
    features: [
      {
        title: 'Caption product demos',
        description:
          'Add short labels that explain UI changes, features, or next steps without forcing users to read a long paragraph.',
      },
      {
        title: 'Create clearer reaction GIFs',
        description:
          'Overlay short captions for social posts, internal chats, and lightweight content marketing.',
      },
      {
        title: 'Keep the motion visible',
        description:
          'Position text around the action instead of blocking the parts of the frame that viewers need to track.',
      },
    ],
    steps: [
      {
        title: 'Upload or create your GIF',
        description: 'Start with a finished animation or make one from video or images first.',
      },
      {
        title: 'Place and style the text',
        description:
          'Write short, clear copy, choose a readable style, and position it where it supports the motion.',
      },
      {
        title: 'Preview the full loop',
        description:
          'Check that the caption stays readable and does not collide with the action in later frames.',
      },
    ],
    faqs: [
      {
        question: 'How do I put text on a GIF without cluttering it?',
        answer:
          'Keep the copy short, place it away from the main motion path, and use strong contrast instead of decorative styling.',
      },
      {
        question: 'Can I add captions to an animated GIF online?',
        answer:
          'Yes. A browser-based editor can add labels, captions, and short overlays directly on the animation.',
      },
      {
        question: 'What kind of text works best on GIFs?',
        answer:
          'Short labels, step names, and reaction captions usually perform better than long sentences because they are easier to read in motion.',
      },
    ],
    relatedLinks: [
      {
        href: '/edit-gifs',
        label: 'Open the full GIF editor',
        description: 'Use additional frame, crop, and optimization controls.',
      },
      {
        href: '/compress-gif',
        label: 'Optimize after adding text',
        description: 'Reduce file size once the captions are in place.',
      },
    ],
    relatedPostSlugs: [
      'how-to-add-text-to-a-gif-without-cluttering-the-animation',
      'how-to-edit-a-gif-without-losing-quality',
      'best-gif-size-for-email-docs-and-social-media',
    ],
  },
  {
    slug: 'gif-optimizer',
    path: '/compress-gif',
    title: 'Compress GIF to an Exact Size',
    metaTitle: 'Compress GIF Online to Exact KB or MB',
    description:
      'Compress an animated GIF to a specific KB or MB limit. Compare measured output files and download the clearest result under your target.',
    keywords: [
      'gif optimizer',
      'compress gif',
      'reduce gif file size',
      'optimize gif for web',
      'make gif smaller online',
    ],
    intro:
      'Set a real file-size target, then compare measured output variants. The browser balances dimensions, motion, palette, and dithering while keeping your source GIF local.',
    primaryCta: {
      href: getGifEditorIntentHref('optimize'),
      label: 'Compress a GIF now',
      description: 'Set an exact KB or MB target and run the local size search.',
    },
    secondaryCta: {
      href: '/blog/optimize-gif-size-without-losing-quality',
      label: 'Read the optimization guide',
      description: 'Learn which changes reduce GIF weight most effectively.',
    },
    features: [
      {
        title: 'Reduce upload friction',
        description:
          'Smaller GIFs are easier to use in docs, product updates, support articles, and chat tools with tighter size limits.',
      },
      {
        title: 'Improve page performance',
        description:
          'Optimized animations reduce transfer weight and help pages stay more responsive.',
      },
      {
        title: 'Balance quality with size',
        description:
          'Use resizing, cropping, and timing changes together instead of relying on one destructive compression step.',
      },
    ],
    steps: [
      {
        title: 'Open the GIF in the editor',
        description: 'Start with the animation you want to shrink or improve for distribution.',
      },
      {
        title: 'Adjust the biggest size drivers',
        description:
          'Reduce dimensions, crop dead space, or simplify timing until the file reaches a practical balance.',
      },
      {
        title: 'Export and compare results',
        description:
          'Preview the final loop to confirm that readability and motion still hold up at the smaller size.',
      },
    ],
    faqs: [
      {
        question: 'How do I reduce GIF file size without destroying quality?',
        answer:
          'Start by reducing dimensions or cropping unused space, then adjust timing and export settings until the file becomes light enough for the destination.',
      },
      {
        question: 'Why are GIF files so large?',
        answer:
          'GIFs can be heavy because every frame stores pixel data. Large dimensions, long duration, and busy visuals all increase file weight.',
      },
      {
        question: 'What is the fastest way to optimize a GIF for the web?',
        answer:
          'Cropping and resizing usually have the biggest impact first. After that, shorten the loop or simplify frame timing if needed.',
      },
    ],
    relatedLinks: [
      {
        href: '/resize-gif',
        label: 'Resize a GIF',
        description: 'Lower the dimensions before exporting the final file.',
      },
      {
        href: '/crop-gif',
        label: 'Crop a GIF',
        description: 'Remove unused visual area to cut weight further.',
      },
    ],
    relatedPostSlugs: [
      'optimize-gif-size-without-losing-quality',
      'best-gif-size-for-email-docs-and-social-media',
      'resize-a-gif-for-discord-slack-and-notion',
    ],
  },
];

export function getSeoWorkflowPage(slug: string): SeoWorkflowPage {
  const page = seoWorkflowPages.find((entry) => entry.slug === slug);

  if (!page) {
    throw new Error(`Unknown SEO workflow page: ${slug}`);
  }

  return page;
}

export function buildSeoWorkflowMetadata(page: SeoWorkflowPage): Metadata {
  const socialTitle = `${page.metaTitle} | ${SITE_BRAND}`;

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: 'website',
      url: absoluteUrl(page.path),
      title: socialTitle,
      description: page.description,
      images: [
        {
          url: '/hero-dark.png',
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: page.description,
      images: ['/hero-dark.png'],
    },
  };
}

const blogWorkflowLinksBySlug: Record<string, string[]> = {
  'best-gif-size-for-email-docs-and-social-media': ['resize-gif', 'gif-optimizer'],
  'combine-multiple-gifs-into-one-clean-animation': ['edit-gifs', 'gif-optimizer'],
  'gif-vs-webp-vs-apng-which-format-should-you-use': ['gif-optimizer', 'video-to-gif'],
  'how-to-add-text-to-a-gif-without-cluttering-the-animation': ['add-text-to-gif', 'edit-gifs'],
  'how-to-edit-a-gif-without-losing-quality': ['edit-gifs', 'crop-gif', 'rotate-gif'],
  'how-to-make-a-gif-from-a-video': ['video-to-gif', 'gif-optimizer'],
  'make-a-transparent-gif-from-video-or-images': ['image-to-gif', 'edit-gifs'],
  'optimize-gif-size-without-losing-quality': ['gif-optimizer', 'resize-gif', 'crop-gif'],
  'record-screen-and-turn-it-into-a-gif': ['screen-to-video', 'video-to-gif'],
  'resize-a-gif-for-discord-slack-and-notion': ['resize-gif', 'gif-optimizer'],
  'turn-images-into-a-smooth-animated-gif': ['image-to-gif', 'add-text-to-gif'],
};

const genericWorkflowLinks: Record<string, SeoWorkflowLink> = {
  'edit-gifs': {
    href: '/edit-gifs',
    label: 'GIF editor',
    description: 'Open the full editor for crop, resize, timing, and text controls.',
  },
  'video-to-gif': {
    href: '/video-to-gif',
    label: 'Video to GIF converter',
    description: 'Start from a video clip before editing or optimizing the final animation.',
  },
  'image-to-gif': {
    href: '/image-to-gif',
    label: 'Image to GIF maker',
    description: 'Build animated GIFs from photos or screenshots before editing further.',
  },
  'screen-to-video': {
    href: '/screen-to-video',
    label: 'Screen recorder workflow',
    description: 'Record a screen clip first, then convert it into a GIF.',
  },
};

export function getBlogWorkflowLinks(slug: string): SeoWorkflowLink[] {
  const workflowSlugs = blogWorkflowLinksBySlug[slug] ?? ['edit-gifs'];

  return workflowSlugs
    .map((workflowSlug) => {
      const page = seoWorkflowPages.find((entry) => entry.slug === workflowSlug);

      if (page) {
        return {
          href: page.path,
          label: page.title,
          description: page.description,
        } satisfies SeoWorkflowLink;
      }

      return genericWorkflowLinks[workflowSlug];
    })
    .filter((entry): entry is SeoWorkflowLink => Boolean(entry));
}
