import type { Metadata } from 'next';
import { SeoWorkflowLanding } from '@/components/pages/SeoWorkflowLanding';
import { buildSeoWorkflowMetadata, getSeoWorkflowPage } from '@/lib/seo-workflows';

const page = getSeoWorkflowPage('add-text-to-gif');

export const metadata: Metadata = buildSeoWorkflowMetadata(page);

export default function AddTextToGifPage() {
  return <SeoWorkflowLanding page={page} />;
}
