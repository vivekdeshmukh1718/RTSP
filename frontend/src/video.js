import videojs from 'video.js';

const player = videojs('my-video', {
  controls: true,
  autoplay: false,
  sources: [{
    src: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    type: 'application/x-mpegURL'
  }]
});
