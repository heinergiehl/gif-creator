// pages/api/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import { NextApiHandler } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { Readable, Writable, pipeline } from 'stream';
import { promisify } from 'util';
import formidable from 'formidable';
import intoStream from 'into-stream';
const pipelineAsync = promisify(pipeline);
// Assuming you have set the full Cloudinary URL in the environment variables
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
});
export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.formData();
  const file = (await data.get('file')) as File;
  if (!file) {
    return NextResponse.json({ error: 'No File' }, { status: 400 });
  }
  const fileStream = intoStream(file.stream);
  let fileBuffer = Buffer.alloc(0);
  await pipelineAsync(
    fileStream,
    new Writable({
      write(chunk, encoding, callback) {
        const bufferChunk = Buffer.from(chunk.buffer);
        fileBuffer = Buffer.concat([fileBuffer, bufferChunk]);
        callback();
      },
    }),
  );
  const fileBase64 = `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(fileBase64, {
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });
  return NextResponse.json(result);
}
export const config = {
  api: {
    bodyParser: false,
  },
};
