"use client";

import { useEffect, useRef } from 'react';

interface SimpleMeetingProps {
  roomName: string;
  userName: string;
}

export default function SimpleMeeting({ roomName, userName }: SimpleMeetingProps) {
  const jitsiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMeeting = () => {
      if (jitsiRef.current && (window as any).JitsiMeetExternalAPI) {
        new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: roomName,
          width: '100%',
          height: '600px',
          parentNode: jitsiRef.current,
          userInfo: {
            displayName: userName
          }
        });
      }
    };

    // Wait for script to load
    const checkScript = setInterval(() => {
      if ((window as any).JitsiMeetExternalAPI) {
        clearInterval(checkScript);
        loadMeeting();
      }
    }, 100);

    return () => clearInterval(checkScript);
  }, [roomName, userName]);

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <h2 className="font-bold">Meeting Room: {roomName}</h2>
        <p>User: {userName}</p>
      </div>
      <div ref={jitsiRef} className="w-full h-[600px] bg-gray-100 rounded" />
    </div>
  );
}