import type { Metadata } from 'next';
import { SeoWorkflowLanding } from '@/components/pages/SeoWorkflowLanding';
import { buildSeoWorkflowMetadata, getSeoWorkflowPage } from '@/lib/seo-workflows';

const page = getSeoWorkflowPage('gif-optimizer');

export const metadata: Metadata = buildSeoWorkflowMetadata(page);

export default function GifOptimizerPage() {
  return <SeoWorkflowLanding page={page} />;
}
