"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface JitsiEnhancedProps {
  roomName: string;
  displayName: string;
  onJoin?: () => void;
  onLeave?: () => void;
}

export default function JitsiEnhanced({ roomName, displayName, onJoin, onLeave }: JitsiEnhancedProps) {
  const jitsiRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (!jitsiRef.current || !window.JitsiMeetExternalAPI) return;

    const jitsiApi = new window.JitsiMeetExternalAPI('meet.jit.si', {
      roomName: roomName,
      width: '100%',
      height: '500px',
      parentNode: jitsiRef.current,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
      },
      userInfo: {
        displayName: displayName
      }
    });

    // Event listeners
    jitsiApi.addEventListener('videoConferenceJoined', () => {
      setIsJoined(true);
      onJoin?.();
    });

    jitsiApi.addEventListener('videoConferenceLeft', () => {
      setIsJoined(false);
      onLeave?.();
    });

    setApi(jitsiApi);

    return () => {
      jitsiApi.dispose();
    };
  }, [roomName, displayName, onJoin, onLeave]);

  const hangUp = () => {
    if (api) {
      api.executeCommand('hangup');
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Video Call: {roomName}</h3>
          {isJoined && (
            <Button variant="destructive" onClick={hangUp}>
              End Call
            </Button>
          )}
        </div>
        <div ref={jitsiRef} className="w-full h-[500px] rounded-lg overflow-hidden" />
      </CardContent>
    </Card>
  );
}