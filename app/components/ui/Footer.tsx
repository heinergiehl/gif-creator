import { FaRegCopyright } from "react-icons/fa"
export const Footer = () => {
  return (
    <footer className="footer bottom-0 fixed footer-center p-4 bg-base-300 text-base-content">
      <p>
        <span className="flex justify-center items-center">
          GIFMagic.app <FaRegCopyright className="mx-1" /> 2024. All rights
          reserved.
        </span>
      </p>
    </footer>
  )
}
