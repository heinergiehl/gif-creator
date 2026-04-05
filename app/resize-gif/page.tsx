import type { Metadata } from 'next';
import { SeoWorkflowLanding } from '@/components/pages/SeoWorkflowLanding';
import { buildSeoWorkflowMetadata, getSeoWorkflowPage } from '@/lib/seo-workflows';

const page = getSeoWorkflowPage('resize-gif');

export const metadata: Metadata = buildSeoWorkflowMetadata(page);

export default function ResizeGifPage() {
  return <SeoWorkflowLanding page={page} />;
}
