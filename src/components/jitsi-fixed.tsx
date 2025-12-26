"use client";

import { useEffect, useRef, useState } from 'react';

interface JitsiFixedProps {
  roomName: string;
  displayName: string;
  onJoin?: () => void;
  onLeave?: () => void;
}

export default function JitsiFixed({ roomName, displayName, onJoin, onLeave }: JitsiFixedProps) {
  const jitsiRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let api: any = null;

    const initJitsi = () => {
      if (jitsiRef.current && (window as any).JitsiMeetExternalAPI) {
        setIsLoading(false);
        
        api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: roomName,
          width: '100%',
          height: '600px',
          parentNode: jitsiRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
          },
          userInfo: {
            displayName: displayName
          }
        });

        api.addEventListener('videoConferenceJoined', () => {
          console.log('Joined meeting:', roomName);
          onJoin?.();
        });

        api.addEventListener('videoConferenceLeft', () => {
          console.log('Left meeting');
          onLeave?.();
        });
      }
    };

    // Wait for script to load
    const checkJitsi = () => {
      if ((window as any).JitsiMeetExternalAPI) {
        initJitsi();
      } else {
        setTimeout(checkJitsi, 100);
      }
    };

    checkJitsi();

    return () => {
      if (api) {
        api.dispose();
      }
    };
  }, [roomName, displayName, onJoin, onLeave]);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  return <div ref={jitsiRef} className="w-full h-[600px] rounded" />;
}