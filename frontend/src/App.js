import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import './App.css';

function App() {
  const [streams, setStreams] = useState([]);
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState('dark');
  const videoRefs = useRef([]);
  const hlsInstances = useRef({});

 const testStreamUrl = async (url) => {
  try {
    const res = await fetch(url, {
      method: 'GET',
      mode: 'no-cors'  // This bypasses CORS errors but limits response checking
    });
    return true; // Assume okay if no crash
  } catch {
    return false;
  }
};


  const handleAddStream = async () => {
   if (url) {
  setStreams([...streams, { url, status: 'Pending' }]);
  setUrl('');
}

  };

  const handleRemoveStream = (index) => {
    const updatedStreams = [...streams];
    updatedStreams.splice(index, 1);
    setStreams(updatedStreams);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    streams.forEach(({ url }, index) => {
      const video = videoRefs.current[index];
      if (!video) return;

      if (hlsInstances.current[index]) {
        hlsInstances.current[index].destroy();
        delete hlsInstances.current[index];
      }

      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsInstances.current[index] = hls;

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(url);
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(err => console.warn('Playback error:', err));
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(err => console.warn('Native playback failed:', err));
        });
      }
    });

    return () => {
      Object.values(hlsInstances.current).forEach(hls => hls.destroy());
    };
  }, [streams]);

  return (
    <div className={`App ${theme}`}>
      <h2>🎥 RTSP (HLS) Stream Viewer</h2>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="stream-input">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter HLS .m3u8 URL"
        />
        <button className="add-stream" onClick={handleAddStream}>➕ Add Stream</button>
      </div>

      <div className="video-grid">
        {streams.map((stream, index) => (
          <div key={index} className="video-container">
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              controls
              muted
              playsInline
              autoPlay
            />
            <div className="stream-actions">
              <span className="badge">{stream.status}</span>
              <button className="remove-stream" onClick={() => handleRemoveStream(index)}>❌ Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
