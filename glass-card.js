const video = document.querySelector('#bg-video');
const card = document.querySelector('[data-glass-card]');
const canvas = document.querySelector('#dup-image');
const context = canvas.getContext('2d', {
  alpha: false,
  desynchronized: true,
});

const MAX_GLASS_FPS = 60;
const GLASS_FRAME_INTERVAL = 1000 / MAX_GLASS_FPS;
const GLASS_OVERSCAN = 96;
let lastGlassPaint = -Infinity;

function paintGlassFrame(now = performance.now()) {
  if (
    document.hidden ||
    now - lastGlassPaint < GLASS_FRAME_INTERVAL ||
    !video.videoWidth ||
    !video.videoHeight
  ) {
    return;
  }

  const rect = card.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const cover = Math.max(
    viewportWidth / video.videoWidth,
    viewportHeight / video.videoHeight,
  );
  const renderedWidth = video.videoWidth * cover;
  const renderedHeight = video.videoHeight * cover;
  const offsetX = (viewportWidth - renderedWidth) / 2;
  const offsetY = (viewportHeight - renderedHeight) / 2;

  // Copy only the piece of the background that sits behind the card. The old
  // implementation filtered a viewport-sized canvas on every animation frame.
  const sourceX = (rect.left - GLASS_OVERSCAN - offsetX) / cover;
  const sourceY = (rect.top - GLASS_OVERSCAN - offsetY) / cover;
  const sourceWidth = (rect.width + GLASS_OVERSCAN * 2) / cover;
  const sourceHeight = (rect.height + GLASS_OVERSCAN * 2) / cover;
  const width = Math.max(1, Math.round(rect.width + GLASS_OVERSCAN * 2));
  const height = Math.max(1, Math.round(rect.height + GLASS_OVERSCAN * 2));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  try {
    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height,
    );
    lastGlassPaint = now;
  } catch {
    // Metadata can be ready a fraction before the first drawable frame.
  }
}

if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
  const onVideoFrame = (now) => {
    paintGlassFrame(now);
    video.requestVideoFrameCallback(onVideoFrame);
  };

  video.requestVideoFrameCallback(onVideoFrame);
} else {
  const onAnimationFrame = (now) => {
    paintGlassFrame(now);
    requestAnimationFrame(onAnimationFrame);
  };

  requestAnimationFrame(onAnimationFrame);
}

window.addEventListener(
  'resize',
  () => {
    lastGlassPaint = -Infinity;
    paintGlassFrame();
  },
  { passive: true },
);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    lastGlassPaint = -Infinity;
    paintGlassFrame();
  }
});
