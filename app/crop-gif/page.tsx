import type { Metadata } from 'next';
import { SeoWorkflowLanding } from '@/components/pages/SeoWorkflowLanding';
import { buildSeoWorkflowMetadata, getSeoWorkflowPage } from '@/lib/seo-workflows';

const page = getSeoWorkflowPage('crop-gif');

export const metadata: Metadata = buildSeoWorkflowMetadata(page);

export default function CropGifPage() {
  return <SeoWorkflowLanding page={page} />;
}
