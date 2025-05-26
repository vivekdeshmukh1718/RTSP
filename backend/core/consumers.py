import asyncio
import subprocess
from channels.generic.websocket import AsyncWebsocketConsumer
import base64

class StreamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.stream_id = self.scope['url_route']['kwargs']['stream_id']
        await self.accept()

        # Placeholder: replace with RTSP URL lookup by stream_id
        self.rtsp_url = "rtsp://your_test_rtsp_url"

        # Launch FFmpeg process
        self.ffmpeg_process = await asyncio.create_subprocess_exec(
            'ffmpeg',
            '-i', self.rtsp_url,
            '-f', 'mpegts',
            '-codec:v', 'mpeg1video',
            '-codec:a', 'mp2',
            '-',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )

        # Start streaming
        asyncio.create_task(self.stream_video())

    async def disconnect(self, close_code):
        if self.ffmpeg_process:
            self.ffmpeg_process.kill()

    async def receive(self, text_data=None, bytes_data=None):
        pass  # No need to handle client messages for now

    async def stream_video(self):
        try:
            while True:
                data = await self.ffmpeg_process.stdout.read(4096)
                if not data:
                    break
                # Send base64-encoded video chunk
                await self.send(text_data=base64.b64encode(data).decode('utf-8'))
        except Exception as e:
            await self.send(text_data=f"ERROR: {str(e)}")
