import { FaRegCopyright } from 'react-icons/fa';
import Link from 'next/link';
export const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-300 text-base-content fixed bottom-0 flex justify-evenly p-4">
      <div className="flex items-center justify-center space-x-4">
        <Link href="/video-to-gif">
          <span>Video to GIF</span>
        </Link>
        <Link href="/image-to-gif">
          <span>Image to GIF</span>
        </Link>
        <Link href="/screen-to-video">
          <span>Screen To Video</span>
        </Link>
        <Link href="/edit-gifs">
          <span>Edit GIFs</span>
        </Link>
      </div>
      {/* links to the pages */}
      <div className="flex items-center justify-center space-x-4">
        <Link href="/privacy-policy">
          <span>Privacy Policy</span>
        </Link>
        <Link href="/terms-of-service">
          <span>Terms of Service</span>
        </Link>
        <Link href="/contact">
          <span>Contact</span>
        </Link>
      </div>
      <p>
        <span className="flex items-center justify-center">
          GIFMagic.app <FaRegCopyright className="mx-1" /> 2024. All rights reserved.
        </span>
      </p>
    </footer>
  );
};
