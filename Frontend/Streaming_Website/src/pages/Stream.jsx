import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { useSocket } from '../components/context/contextProvider';

const Stream = () => {
  const [stream, setStream] = useState(null);
  const socket = useSocket();

  const handleStart = async () => {
    const userStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    setStream(userStream);
  }

  const stopVideo = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  const sendStream = async () => {
    if (!stream) {
      console.error("Stream is not available.");
      return;
    }

    const mediaRecorderConstraints = new MediaRecorder(stream, {
      audioBitsPerSecond: 32000,
      videoBitsPerSecond: 2500000,
      framerate: 25
    });

    try {
      const streamRecorder = new MediaRecorder(stream, mediaRecorderConstraints);

      streamRecorder.ondataavailable = event => {
        const chunk = event.data;
        socket.emit('stream:incoming', chunk)
      };

      streamRecorder.start(25);

    } catch (error) {
      console.error('Error creating MediaRecorder:', error);
    }
  };

  // streamRecorder.ondataavailable = event => {
  //   if (event.data.size > 0) {
  //     socket.emit('stream:incoming', event.data)
  //   }
  // }

  return (
    <React.Fragment>
      <h1>Streaming Site</h1>
      <div>
        <ReactPlayer
          playing
          muted
          height="400px"
          width="400px"
          url={stream}
        />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleStart}>Start</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={stopVideo}>Stop</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={sendStream}>Send</button>
      </div>
    </React.Fragment>
  );
};

export default Stream;
