import { ImageResourceClient } from './ImageResourceClient';
import { getImageResults } from './utils/getImageResults';
import { Suspense } from 'react';
interface ImageSearchProps {
  query: string;
  imageType: string;
}
const ImageSearch = async ({ query, imageType }: ImageSearchProps) => {
  const images = await getImageResults(query, imageType); // Fetch image data on the server
  return <ImageResourceClient images={images} />;
};
export const ImageSearchSuspended = ({ query, imageType }: ImageSearchProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImageSearch query={query} imageType={imageType} />
    </Suspense>
  );
};
