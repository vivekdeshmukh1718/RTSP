import Hls from 'hls.js';

const video = document.getElementById('video');
const videoSrc = "http://localhost:8080/proxy?url=https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(videoSrc);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, function() {
    video.play();
  });
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  // Native HLS support (Safari)
  video.src = videoSrc;
  video.addEventListener('loadedmetadata', function() {
    video.play();
  });
}
