"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function VideoCallPage() {
  const [roomName] = useState('MedSeva-' + Date.now());
  const [userName, setUserName] = useState('');
  const [inCall, setInCall] = useState(false);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.onload = () => setJitsiLoaded(true);
    document.head.appendChild(script);
  }, []);

  const startCall = () => {
    if (jitsiLoaded && userName.trim()) {
      const container = document.getElementById('jitsi-container');
      if (container) {
        new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: roomName,
          width: '100%',
          height: '600px',
          parentNode: container,
          userInfo: {
            displayName: userName
          }
        });
        setInCall(true);
      }
    }
  };

  if (!userName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <h1 className="text-2xl font-bold text-center">Join Video Call</h1>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full p-3 border rounded"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  setUserName(target.value.trim());
                }
              }
            }}
          />
          <Button
            className="w-full"
            onClick={() => {
              const input = document.querySelector('input') as HTMLInputElement;
              if (input?.value.trim()) {
                setUserName(input.value.trim());
              }
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (!inCall) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <h1 className="text-xl font-bold text-center">Ready to Join</h1>
          <div className="text-center space-y-2">
            <p>Name: <strong>{userName}</strong></p>
            <p>Room: <strong>{roomName}</strong></p>
            <p>Status: {jitsiLoaded ? '✅ Ready' : '⏳ Loading...'}</p>
          </div>
          <Button
            className="w-full"
            onClick={startCall}
            disabled={!jitsiLoaded}
          >
            {jitsiLoaded ? 'Start Video Call' : 'Loading...'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{userName}</h1>
            <p className="text-sm text-gray-600">Room: {roomName}</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            End Call
          </Button>
        </div>
        <div
          id="jitsi-container"
          className="w-full h-[600px] bg-gray-100 rounded border"
        />
      </div>
    </div>
  );
}