"use client";

import { JitsiMeeting } from '@jitsi/react-sdk';

interface JitsiMeetingProps {
  roomName: string;
  displayName: string;
  onApiReady?: (api: any) => void;
}

export default function JitsiMeetingComponent({ roomName, displayName, onApiReady }: JitsiMeetingProps) {
  return (
    <JitsiMeeting
      domain="meet.jit.si"
      roomName={roomName}
      configOverwrite={{
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableModeratorIndicator: true,
        enableEmailInStats: false,
        prejoinPageEnabled: false,
        requireDisplayName: false,
        enableWelcomePage: false,
        enableClosePage: false,
        disableDeepLinking: true,
        enableUserRolesBasedOnToken: false,
        enableNoAudioSignal: false,
        enableNoisyMicDetection: false,
        moderatedRoomServiceUrl: undefined,
        enableModeratedMode: false,
        disableRemoteMute: true,
        disableKick: true,
        disablePrivateChat: false,
        hideConferenceSubject: true,
        hideConferenceTimer: false,
      }}
      interfaceConfigOverwrite={{
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        APP_NAME: 'Arogya Seva',
        SHOW_CHROME_EXTENSION_BANNER: false,
        MOBILE_APP_PROMO: false,
        HIDE_INVITE_MORE_HEADER: true,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        DISABLE_FOCUS_INDICATOR: true,
        DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
      }}
      userInfo={{
        displayName: displayName
      }}
      onApiReady={(externalApi) => {
        console.log('Jitsi API ready');
        
        // Handle end call with confirmation
        externalApi.addEventListener('readyToClose', () => {
          const confirmed = window.confirm('Are you sure you want to end the meeting?');
          if (!confirmed) {
            // Prevent closing if user cancels
            return false;
          }
        });
        
        onApiReady?.(externalApi);
      }}
      getIFrameRef={(iframeRef) => { 
        if (iframeRef) {
          iframeRef.style.height = '600px';
          iframeRef.style.width = '100%';
        }
      }}
    />
  );
}