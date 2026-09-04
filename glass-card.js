const video = document.querySelector('#bg-video');
const card = document.querySelector('[data-glass-card]');
const duplicate = document.querySelector('#dup-video-container');
const canvas = document.querySelector('#dup-image');
const context = canvas.getContext('2d', { alpha: false });

const DUP_PIXEL_RATIO = 1;

function syncGlassFrame() {
  requestAnimationFrame(syncGlassFrame);

  const rect = card.getBoundingClientRect();
  if (!rect.width || !rect.height || !video.videoWidth || !video.videoHeight) {
    return;
  }

  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  // Viewport sizing is deliberate: channel-shift bands stay beyond the card,
  // leaving only clean refraction inside its clipped, rounded silhouette.
  duplicate.style.left = -rect.left + 'px';
  duplicate.style.top = -rect.top + 'px';
  duplicate.style.width = vw + 'px';
  duplicate.style.height = vh + 'px';

  // The duplicate stays at 1x on retina. SVG filter cost scales with pixel
  // count, while the soft refraction gains nothing useful from 4x the work.
  const w = Math.max(1, Math.round(vw * DUP_PIXEL_RATIO));
  const h = Math.max(1, Math.round(vh * DUP_PIXEL_RATIO));

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  const cover = Math.max(vw / video.videoWidth, vh / video.videoHeight);
  const sw = vw / cover;
  const sh = vh / cover;
  const sx = (video.videoWidth - sw) / 2;
  const sy = (video.videoHeight - sh) / 2;

  try {
    context.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
  } catch {
    // The browser can briefly expose metadata before a frame is decodable.
  }
}

requestAnimationFrame(syncGlassFrame);
