import { getUid } from '@/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
const ffmpeg = new FFmpeg({ log: true });
self.onmessage = async (e) => {
  console.log('Worker received message');
  const { file, videoSettings } = e.data;
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({}).catch((e) => console.error(e));
  if (ffmpeg.loaded) console.log('FFmpeg loaded' + ffmpeg.loaded);
  await ffmpeg.writeFile('input.mp4', await fetchFile(file)).catch((e) => console.error(e));
  // get file
  console.log(await ffmpeg.readFile('input.mp4'));
  const outputOptions = ['-i', 'input.mp4', '-vf', `r`, '2', 'output%03d.png'];
  const frames = [];
  await ffmpeg
    .exec(['-i', 'input.mp4', '-vf', `fps=2`, 'output%03d.png'])
    .catch((e) => console.error(e));
  for (let i = 1; i <= 10; i++) {
    const f = await ffmpeg
      .readFile(`output${i.toString().padStart(3, '0')}.png`)
      .catch((e) => console.error(e));
    frames.push(f);
  }
  console.log('Frames', frames);
  self.postMessage({ frames });
  self.close();
};
