import { Metadata } from "next"
import Link from "next/link"
import { Footer } from "../components/ui/Footer"
export const metadata: Metadata = {
  title: "Free Image to GIF Converter and Editor",
  description:
    "Convert images to GIFs, and edit them. This means you can add other elemens to the GIF, like text, images, and more.",
  keywords: "image, gif, converter, editor, free",
}
export default function ImageToGif() {
  return (
    <div>
      <main className="font-sans mt-16">
        <section className="hero bg-base-200 text-center">
          <div className="hero-content">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">
                Turn Images into GIFs Instantly
              </h1>
              <p className="py-6">
                With GifMagic.app, elevate your images into animated art. Layer
                your pictures, finesse with custom text, and add a splash of
                creativity with a suite of editing tools. No wait times, no fees
                — just GIF magic at your fingertips.
              </p>
              <Link href="/image-to-gif/converter-and-editor">
                <span className="btn btn-primary">Create Your GIF</span>
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">
              Image to GIF Conversion Made Simple
            </h2>
            <p className="mb-8">
              Whether you're looking to make a reaction GIF, animate your
              photos, or just add some fun to your images, GifMagic.app makes it
              a breeze. Jump right into our editor and start creating — no
              tutorials needed, no accounts required.
            </p>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  )
}
