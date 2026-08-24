import AccountForm from './acount-form';
import { createClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
};
export default async function Account() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <AccountForm user={user} />;
}
