import { createClient } from './client';
const supabase = createClient();
export const fetchUserVideos = async (userId: string) => {
  const { data, error } = await supabase.from('videos').select('*').eq('user_id', userId);
  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
  return data;
};
