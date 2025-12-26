# Jitsi Meet Integration Guide

## Step-by-Step Integration

### 1. External API Script Loading
```javascript
// Dynamically load Jitsi Meet External API
const script = document.createElement('script');
script.src = 'https://meet.jit.si/external_api.js';
script.async = true;
script.onload = initializeJitsi;
document.head.appendChild(script);
```

### 2. Jitsi Configuration
```javascript
const options = {
  roomName: roomName, // Unique room identifier
  width: '100%',
  height: '600px',
  parentNode: containerRef.current,
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
```

### 3. Event Listeners
```javascript
// Meeting joined
jitsiApi.addEventListener('videoConferenceJoined', async () => {
  setIsLoading(false);
  await joinMeeting(meetingId, user.uid, userType);
});

// Meeting ended
jitsiApi.addEventListener('videoConferenceLeft', handleMeetingEnd);
jitsiApi.addEventListener('readyToClose', handleMeetingEnd);
```

### 4. Room Name Generation
```javascript
const generateRoomName = (doctorName, patientName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const cleanDoctorName = doctorName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPatientName = patientName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `medseva_dr_${cleanDoctorName}_pt_${cleanPatientName}_${timestamp}_${random}`;
};
```

### 5. Meeting Flow
1. **Create Meeting** → Generate unique room name → Save to database
2. **Join Meeting** → Load Jitsi with room name → Track participation
3. **End Meeting** → Update status → Cleanup resources

### 6. Emergency Call Flow
1. **Patient clicks Emergency** → Creates emergency call → Waits for doctor
2. **Doctor sees notification** → Joins emergency call → Meeting starts
3. **Both users in Jitsi** → Video consultation → Meeting ends

## Features Implemented
- ✅ Unique room generation
- ✅ Real-time meeting status
- ✅ Emergency instant calls
- ✅ Doctor-patient matching
- ✅ Meeting history tracking
- ✅ Jitsi embed integration