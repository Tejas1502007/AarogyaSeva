"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import JitsiMeetingComponent from './jitsi-meeting';

export default function QuickMeeting() {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inMeeting, setInMeeting] = useState(false);

  const startMeeting = () => {
    if (displayName.trim()) {
      const room = roomName.trim() || 'medseva-' + Date.now();
      setRoomName(room);
      setInMeeting(true);
    }
  };

  if (inMeeting) {
    return (
      <div className="h-screen w-screen">
        <div className="h-16 bg-gray-800 text-white flex items-center justify-between px-4">
          <div>
            <span className="font-semibold">{displayName}</span>
            <span className="ml-4 text-sm text-gray-300">Room: {roomName}</span>
          </div>
          <Button 
            variant="destructive" 
            onClick={() => setInMeeting(false)}
          >
            Leave Meeting
          </Button>
        </div>
        <div className="h-[calc(100vh-4rem)]">
          <JitsiMeetingComponent 
            roomName={roomName}
            displayName={displayName}
            onApiReady={(api) => {
              console.log('Quick meeting started');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Start Video Meeting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Room Name (Optional)</label>
            <input
              type="text"
              placeholder="Leave blank for random room"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-3 border rounded"
            />
          </div>
          <Button 
            onClick={startMeeting}
            disabled={!displayName.trim()}
            className="w-full"
          >
            Start Meeting
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}