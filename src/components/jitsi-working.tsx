"use client";

import { useEffect, useRef, useState } from 'react';

export default function JitsiWorking() {
  const jitsiRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initJitsi = () => {
      if (jitsiRef.current) {
        const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: 'MedSevaTest' + Date.now(),
          width: '100%',
          height: '600px',
          parentNode: jitsiRef.current,
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            startWithVideoMuted: false,
          },
          userInfo: {
            displayName: 'Test User'
          }
        });
        
        api.addEventListener('videoConferenceJoined', () => {
          console.log('Meeting joined successfully!');
          setIsLoaded(true);
        });
      }
    };

    // Load script if not exists
    if (!(window as any).JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initJitsi;
      document.head.appendChild(script);
    } else {
      initJitsi();
    }
  }, []);

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <h3 className="font-bold">Jitsi Meet Test</h3>
        <p>Status: {isLoaded ? '✅ Connected' : '⏳ Loading...'}</p>
      </div>
      <div 
        ref={jitsiRef} 
        className="w-full h-[600px] border-2 border-gray-300 rounded bg-gray-100"
      />
    </div>
  );
}