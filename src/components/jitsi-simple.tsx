"use client";

import { useEffect, useRef } from 'react';

export default function JitsiSimple() {
  const jitsiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadJitsi = () => {
      if (jitsiRef.current && (window as any).JitsiMeetExternalAPI) {
        new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: 'test-room-' + Math.random().toString(36).substr(2, 9),
          width: '100%',
          height: '400px',
          parentNode: jitsiRef.current,
        });
      }
    };

    if ((window as any).JitsiMeetExternalAPI) {
      loadJitsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = loadJitsi;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Jitsi Meet Test</h2>
      <div ref={jitsiRef} className="w-full h-[400px] border rounded" />
    </div>
  );
}