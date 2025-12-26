"use client";

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { joinMeeting, endMeeting } from '@/lib/meeting-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetProps {
  roomName: string;
  meetingId: string;
  userType: 'doctor' | 'patient';
  displayName: string;
  onMeetingEnd?: () => void;
}

export default function JitsiMeet({ roomName, meetingId, userType, displayName, onMeetingEnd }: JitsiMeetProps) {
  const { user } = useAuth();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!user || !jitsiContainerRef.current) return;

    const loadJitsi = () => {
      if (window.JitsiMeetExternalAPI) {
        initializeJitsi();
      } else {
        setTimeout(loadJitsi, 100);
      }
    };

    if (window.JitsiMeetExternalAPI) {
      initializeJitsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = loadJitsi;
      document.head.appendChild(script);
    }

    return () => {
      if (api) {
        api.dispose();
      }
    };
  }, [user, roomName]);

  const initializeJitsi = async () => {
    if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current) return;

    const options = {
      roomName: roomName,
      width: '100%',
      height: '600px',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        APP_NAME: 'MedSeva Consultation',
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
      userInfo: {
        displayName: displayName,
        email: user?.email || ''
      }
    };

    const jitsiApi = new window.JitsiMeetExternalAPI('meet.jit.si', options);
    setApi(jitsiApi);

    jitsiApi.addEventListener('videoConferenceJoined', async () => {
      setIsLoading(false);
      await joinMeeting(meetingId, user!.uid, userType);
    });

    jitsiApi.addEventListener('videoConferenceLeft', handleMeetingEnd);
    jitsiApi.addEventListener('readyToClose', handleMeetingEnd);
  };

  const handleMeetingEnd = async () => {
    if (userType === 'doctor') {
      await endMeeting(meetingId);
    }
    if (onMeetingEnd) {
      onMeetingEnd();
    }
  };

  const hangUp = () => {
    if (api) {
      api.executeCommand('hangup');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Joining Meeting...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009688]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">MedSeva Consultation</h3>
              <span className="text-sm text-muted-foreground">Room: {roomName}</span>
            </div>
            <Button variant="destructive" size="sm" onClick={hangUp}>
              <PhoneOff className="h-4 w-4 mr-2" />
              End Call
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div ref={jitsiContainerRef} className="w-full h-[600px] rounded-lg overflow-hidden" />
        </CardContent>
      </Card>
    </div>
  );
}