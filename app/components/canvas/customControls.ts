import { fabric } from 'fabric';
import { add } from 'lodash';
// Custom mouse cursor for rotation
export function mouseRotateIcon(angle: number): string {
  const relativeAngle = angle - 90;
  const pos: { [key: number]: string } = {
    '-90': '9.25 5.25',
    '-75': '9.972 3.863',
    '-60': '10.84 1.756',
    '-45': '11.972 -1.716',
    '-30': '18.83 0.17',
    '-15': '28.49 -9.49',
    '15': '-7.985 46.77',
    '30': '-0.415 27.57',
    '45': '2.32 21.713',
    '60': '3.916 18.243',
    '75': '4.762 16.135',
    '90': '5.25 14.75',
    '105': '5.84 13.617',
    '120': '6.084 12.666',
    '135': '6.317 12.01',
    '150': '6.754 11.325',
    '165': '7.06 10.653',
    '180': '7.25 10',
    '195': '7.597 9.43',
    '210': '7.825 8.672',
    '225': '7.974 7.99',
    '240': '8.383 7.332',
    '255': '8.83 6.441',
  };
  const defaultPos = '7.25 10';
  const transform =
    relativeAngle === 0
      ? 'translate(9.5 3.5)'
      : `rotate(${relativeAngle} ${pos[relativeAngle] || defaultPos})`;
  const imgCursor = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24'>
      <defs>
        <filter id='a' width='266.7%' height='156.2%' x='-75%' y='-21.9%' filterUnits='objectBoundingBox'>
          <feOffset dy='1' in='SourceAlpha' result='shadowOffsetOuter1'/>
          <feGaussianBlur in='shadowOffsetOuter1' result='shadowBlurOuter1' stdDeviation='1'/>
          <feColorMatrix in='shadowBlurOuter1' result='shadowMatrixOuter1' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/>
          <feMerge>
            <feMergeNode in='shadowMatrixOuter1'/>
            <feMergeNode in='SourceGraphic'/>
          </feMerge>
        </filter>
        <path id='b' d='M1.67 12.67a7.7 7.7 0 0 0 0-9.34L0 5V0h5L3.24 1.76a9.9 9.9 0 0 1 0 12.48L5 16H0v-5l1.67 1.67z'/>
      </defs>
      <g fill='none' fill-rule='evenodd'>
        <path d='M0 24V0h24v24z'/>
        <g fill-rule='nonzero' filter='url(#a)' transform='${transform}'>
          <use fill='#000' fill-rule='evenodd' xlink:href='#b'/>
          <path stroke='#FFF' d='M1.6 11.9a7.21 7.21 0 0 0 0-7.8L-.5 6.2V-.5h6.7L3.9 1.8a10.4 10.4 0 0 1 0 12.4l2.3 2.3H-.5V9.8l2.1 2.1z'/>
        </g>
      </g>
    </svg>`);
  return `url("data:image/svg+xml;charset=utf-8,${imgCursor}") 12 12, crosshair`;
}
export function treatAngle(angle: number): number {
  return angle - (angle % 15);
}
// Custom icon for rotation control
export const svgRotateIcon = encodeURIComponent(`
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d)">
      <circle cx="9" cy="9" r="5" fill="white"/>
      <circle cx="9" cy="9" r="4.75" stroke="black" stroke-opacity="0.3" stroke-width="0.5"/>
    </g>
    <path d="M10.8047 11.1242L9.49934 11.1242L9.49934 9.81885" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.94856 6.72607L8.25391 6.72607L8.25391 8.03142" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.69517 6.92267C10.007 7.03301 10.2858 7.22054 10.5055 7.46776C10.7252 7.71497 10.8787 8.01382 10.9517 8.33642C11.0247 8.65902 11.0148 8.99485 10.9229 9.31258C10.831 9.63031 10.6601 9.91958 10.4262 10.1534L9.49701 11.0421M8.25792 6.72607L7.30937 7.73554C7.07543 7.96936 6.90454 8.25863 6.81264 8.57636C6.72073 8.89408 6.71081 9.22992 6.78381 9.55251C6.8568 9.87511 7.01032 10.174 7.23005 10.4212C7.44978 10.6684 7.72855 10.8559 8.04036 10.9663" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <defs>
      <filter id="filter0_d" x="0" y="0" width="18" height="18" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
        <feOffset/>
        <feGaussianBlur stdDeviation="2"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.137674 0 0 0 0 0.190937 0 0 0 0 0.270833 0 0 0 0.15 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
    </defs>
  </svg>
`);
const rotateIcon = `data:image/svg+xml;utf8,${svgRotateIcon}`;
const imgIcon = document.createElement('img');
imgIcon.src = rotateIcon;
export const renderIcon = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: any,
  fabricObject: fabric.Object,
) => {
  const size = 60;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
  ctx.drawImage(imgIcon, -size / 2, -size / 2, size, size);
  ctx.restore();
};
export const rotationStyleHandler = (
  eventData: MouseEvent,
  control: fabric.Control,
  fabricObject: fabric.Object,
) => {
  if (fabricObject.lockRotation) {
    return 'not-allowed';
  }
  const angle = treatAngle(fabricObject?.angle || 0);
  return mouseRotateIcon(angle);
};
// fabric.Object.prototype.controls.mtr = new fabric.Control({
//   x: 0,
//   y: -0.5,
//   offsetX: 0,
//   offsetY: -60,
//   cursorStyleHandler: rotationStyleHandler,
//   actionHandler: fabric.controlsUtils.rotationWithSnapping,
//   actionName: 'rotate',
//   render: renderIcon,
// });
// // also make sure every fabric object has this rotation control
// fabric.Textbox.prototype.controls.mtr = new fabric.Control({
//   x: 0,
//   y: -0.5,
//   offsetX: 0,
//   offsetY: -60,
//   cursorStyleHandler: rotationStyleHandler,
//   actionHandler: fabric.controlsUtils.rotationWithSnapping,
//   actionName: 'rotate',
//   render: renderIcon,
// });
// fabric.Textbox.prototype.controls.delete = new fabric.Control({
//   x: 0.5,
//   y: -0.5,
//   offsetY: -60,
//   cursorStyleHandler: () => 'pointer',
//   render: (ctx, left, top, styleOverride, fabricObject) => {
//     const size = 60;
//     ctx.save();
//     ctx.translate(left, top);
//     ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
//     ctx.restore();
//   },
//   visible: false,
//   withConnection: false,
// });
// fabric.Textbox.prototype.controls.copied = new fabric.Control({
//   x: 0.5,
//   y: -0.5,
//   offsetY: -60,
//   cursorStyleHandler: () => 'pointer',
//   render: (ctx, left, top, styleOverride, fabricObject) => {
//     const size = 60;
//     ctx.save();
//     ctx.translate(left, top);
//     ctx.drawImage(copiedImg, -size / 2, -size / 2, size, size);
//     ctx.restore();
//   },
//   visible: false,
//   withConnection: false,
// });
// fabric.Textbox.prototype.controls.copiedSuccess = new fabric.Control({
//   x: 0.5,
//   y: -0.5,
//   offsetY: -60,
//   cursorStyleHandler: () => 'pointer',
//   render: (ctx, left, top, styleOverride, fabricObject) => {
//     const size = 60;
//     ctx.save();
//     ctx.translate(left, top);
//     ctx.drawImage(copiedSuccessImg, -size / 2, -size / 2, size, size);
//     ctx.restore();
//   },
//   visible: false,
//   withConnection: false,
// });
// lets create a nice icon that shows that something has been copied to the clipboard
const copiedIcon = encodeURIComponent(`
<svg fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Text-files"> <path d="M53.9791489,9.1429005H50.010849c-0.0826988,0-0.1562004,0.0283995-0.2331009,0.0469999V5.0228 C49.7777481,2.253,47.4731483,0,44.6398468,0h-34.422596C7.3839517,0,5.0793519,2.253,5.0793519,5.0228v46.8432999 c0,2.7697983,2.3045998,5.0228004,5.1378999,5.0228004h6.0367002v2.2678986C16.253952,61.8274002,18.4702511,64,21.1954517,64 h32.783699c2.7252007,0,4.9414978-2.1725998,4.9414978-4.8432007V13.9861002 C58.9206467,11.3155003,56.7043495,9.1429005,53.9791489,9.1429005z M7.1110516,51.8661003V5.0228 c0-1.6487999,1.3938999-2.9909999,3.1062002-2.9909999h34.422596c1.7123032,0,3.1062012,1.3422,3.1062012,2.9909999v46.8432999 c0,1.6487999-1.393898,2.9911003-3.1062012,2.9911003h-34.422596C8.5049515,54.8572006,7.1110516,53.5149002,7.1110516,51.8661003z M56.8888474,59.1567993c0,1.550602-1.3055,2.8115005-2.9096985,2.8115005h-32.783699 c-1.6042004,0-2.9097996-1.2608986-2.9097996-2.8115005v-2.2678986h26.3541946 c2.8333015,0,5.1379013-2.2530022,5.1379013-5.0228004V11.1275997c0.0769005,0.0186005,0.1504021,0.0469999,0.2331009,0.0469999 h3.9682999c1.6041985,0,2.9096985,1.2609005,2.9096985,2.8115005V59.1567993z"></path> <path d="M38.6031494,13.2063999H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0158005 c0,0.5615997,0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4542999,1.0158997-1.0158997 C39.6190491,13.6606998,39.16465,13.2063999,38.6031494,13.2063999z"></path> <path d="M38.6031494,21.3334007H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0157986 c0,0.5615005,0.4544001,1.0159016,1.0159006,1.0159016h22.3491974c0.5615005,0,1.0158997-0.454401,1.0158997-1.0159016 C39.6190491,21.7877007,39.16465,21.3334007,38.6031494,21.3334007z"></path> <path d="M38.6031494,29.4603004H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997 s0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4543991,1.0158997-1.0158997 S39.16465,29.4603004,38.6031494,29.4603004z"></path> <path d="M28.4444485,37.5872993H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997 s0.4544001,1.0158997,1.0159006,1.0158997h12.1904964c0.5615025,0,1.0158005-0.4543991,1.0158005-1.0158997 S29.0059509,37.5872993,28.4444485,37.5872993z"></path> </g> </g></svg>
`);
const copiedSuccessIcon = encodeURIComponent(
  `<svg fill="#11e4a1" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" stroke="#11e4a1"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Text-files"> <path d="M53.9791489,9.1429005H50.010849c-0.0826988,0-0.1562004,0.0283995-0.2331009,0.0469999V5.0228 C49.7777481,2.253,47.4731483,0,44.6398468,0h-34.422596C7.3839517,0,5.0793519,2.253,5.0793519,5.0228v46.8432999 c0,2.7697983,2.3045998,5.0228004,5.1378999,5.0228004h6.0367002v2.2678986C16.253952,61.8274002,18.4702511,64,21.1954517,64 h32.783699c2.7252007,0,4.9414978-2.1725998,4.9414978-4.8432007V13.9861002 C58.9206467,11.3155003,56.7043495,9.1429005,53.9791489,9.1429005z M7.1110516,51.8661003V5.0228 c0-1.6487999,1.3938999-2.9909999,3.1062002-2.9909999h34.422596c1.7123032,0,3.1062012,1.3422,3.1062012,2.9909999v46.8432999 c0,1.6487999-1.393898,2.9911003-3.1062012,2.9911003h-34.422596C8.5049515,54.8572006,7.1110516,53.5149002,7.1110516,51.8661003z M56.8888474,59.1567993c0,1.550602-1.3055,2.8115005-2.9096985,2.8115005h-32.783699 c-1.6042004,0-2.9097996-1.2608986-2.9097996-2.8115005v-2.2678986h26.3541946 c2.8333015,0,5.1379013-2.2530022,5.1379013-5.0228004V11.1275997c0.0769005,0.0186005,0.1504021,0.0469999,0.2331009,0.0469999 h3.9682999c1.6041985,0,2.9096985,1.2609005,2.9096985,2.8115005V59.1567993z"></path> <path d="M38.6031494,13.2063999H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0158005 c0,0.5615997,0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4542999,1.0158997-1.0158997 C39.6190491,13.6606998,39.16465,13.2063999,38.6031494,13.2063999z"></path> <path d="M38.6031494,21.3334007H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0157986 c0,0.5615005,0.4544001,1.0159016,1.0159006,1.0159016h22.3491974c0.5615005,0,1.0158997-0.454401,1.0158997-1.0159016 C39.6190491,21.7877007,39.16465,21.3334007,38.6031494,21.3334007z"></path> <path d="M38.6031494,29.4603004H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997 s0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4543991,1.0158997-1.0158997 S39.16465,29.4603004,38.6031494,29.4603004z"></path> <path d="M28.4444485,37.5872993H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997 s0.4544001,1.0158997,1.0159006,1.0158997h12.1904964c0.5615025,0,1.0158005-0.4543991,1.0158005-1.0158997 S29.0059509,37.5872993,28.4444485,37.5872993z"></path> </g> </g></svg>`,
);
export const copiedSuccessIconUrl = `data:image/svg+xml;charset=utf-8,${copiedSuccessIcon}`;
export const copiedSuccessImg = document.createElement('img');
copiedSuccessImg.src = copiedSuccessIconUrl;
const copiedIconUrl = `data:image/svg+xml;charset=utf-8,${copiedIcon}`;
export const copiedImg = document.createElement('img');
copiedImg.src = copiedIconUrl;
// lets create a nice icon that shows that something has been duplicated
// fabric.Object.prototype.controls.copied = new fabric.Control({
//   x: 0.5,
//   y: -0.5,
//   offsetY: -60,
//   cursorStyleHandler: () => 'pointer',
//   render: (ctx, left, top, styleOverride, fabricObject) => {
//     const size = 60;
//     ctx.save();
//     ctx.translate(left, top);
//     ctx.drawImage(copiedImg, -size / 2, -size / 2, size, size);
//     ctx.restore();
//   },
//   visible: false,
//   cornerSize: 38,
//   withConnection: false,
// });
const deleteIcon = encodeURIComponent(`
<svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M960 160h-291.2a160 160 0 0 0-313.6 0H64a32 32 0 0 0 0 64h896a32 32 0 0 0 0-64zM512 96a96 96 0 0 1 90.24 64h-180.48A96 96 0 0 1 512 96zM844.16 290.56a32 32 0 0 0-34.88 6.72A32 32 0 0 0 800 320a32 32 0 1 0 64 0 33.6 33.6 0 0 0-9.28-22.72 32 32 0 0 0-10.56-6.72zM832 416a32 32 0 0 0-32 32v96a32 32 0 0 0 64 0v-96a32 32 0 0 0-32-32zM832 640a32 32 0 0 0-32 32v224a32 32 0 0 1-32 32H256a32 32 0 0 1-32-32V320a32 32 0 0 0-64 0v576a96 96 0 0 0 96 96h512a96 96 0 0 0 96-96v-224a32 32 0 0 0-32-32z" fill="#231815"></path><path d="M384 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM544 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM704 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0z" fill="#231815"></path></g></svg>`);
const deleteIconUrl = `data:image/svg+xml;charset=utf-8,${deleteIcon}`;
export const deleteImg = document.createElement('img');
deleteImg.src = deleteIconUrl;
