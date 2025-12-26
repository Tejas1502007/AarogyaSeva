"use client";

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiBasicProps {
  roomName: string;
  displayName: string;
}

export default function JitsiBasic({ roomName, displayName }: JitsiBasicProps) {
  const jitsiRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJitsi = () => {
      if (window.JitsiMeetExternalAPI && jitsiRef.current) {
        try {
          const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
            roomName: roomName,
            width: '100%',
            height: '500px',
            parentNode: jitsiRef.current,
            userInfo: {
              displayName: displayName
            }
          });
          setIsLoading(false);
          return () => api.dispose();
        } catch (err) {
          setError('Failed to load meeting');
          setIsLoading(false);
        }
      }
    };

    if (window.JitsiMeetExternalAPI) {
      loadJitsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = loadJitsi;
      script.onerror = () => {
        setError('Failed to load Jitsi script');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }
  }, [roomName, displayName]);

  if (isLoading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-red-50 rounded border border-red-200">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return <div ref={jitsiRef} className="w-full h-[500px] rounded" />;
}