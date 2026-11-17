import React, { useState, useEffect, useRef } from 'react';

const WebRTC = ({ roomName, onStatusChange }) => {
  const [status, setStatus] = useState('Disconnected');
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    // Initialize WebRTC
    const initWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }
        
        // Setup peer connection scaffolding
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        pc.oniceconnectionstatechange = () => {
          setStatus(pc.iceConnectionState);
          if (onStatusChange) onStatusChange(pc.iceConnectionState);
        };

        // Note: Signaling logic (offer/answer/ice candidates exchange) would go here
        
      } catch (error) {
        console.error('Error accessing media devices.', error);
        setStatus('Error');
      }
    };

    initWebRTC();

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomName, onStatusChange]);

  return (
    <div className="webrtc-container" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h4>Voice Chat</h4>
      <p>Status: {status}</p>
      <audio ref={localAudioRef} autoPlay muted style={{ display: 'none' }} />
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
      
      <div className="controls">
        <button onClick={() => setStatus('Calling...')} disabled={status !== 'Disconnected'}>Call</button>
        <button onClick={() => setStatus('Disconnected')} disabled={status === 'Disconnected'}>End</button>
      </div>
    </div>
  );
};

export default WebRTC;
