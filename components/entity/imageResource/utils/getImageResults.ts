export const getImageResults = async (query: string, imageType: string) => {
  const API_KEY = '43266925-5f9d4a4a69a0b1f37c83e9c7a';
  const response = await fetch(
    `https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=${imageType}`,
  );
  const data = await response.json();
  return data.hits;
};
