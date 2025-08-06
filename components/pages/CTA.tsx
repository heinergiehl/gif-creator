import Link from 'next/link';

export const CTA = () => {
  return (
    <Link 
      href="/create-and-edit-gifs/converter-and-editor"
      className="inline-flex items-center px-8 py-4 text-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      Create a GIF now
    </Link>
  );
};
