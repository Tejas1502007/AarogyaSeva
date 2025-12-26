"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import JitsiMeetingComponent from '@/components/jitsi-meeting';

interface PatientJoinProps {
  roomId: string;
}

export default function PatientJoin({ roomId }: PatientJoinProps) {
  const [joined, setJoined] = useState(false);
  const [patientName, setPatientName] = useState('');

  const joinMeeting = () => {
    if (patientName.trim()) {
      setJoined(true);
    }
  };

  if (joined) {
    return (
      <div className="h-screen">
        <div className="h-16 bg-green-600 text-white flex items-center justify-between px-4">
          <div>
            <span className="font-semibold">{patientName}</span>
            <span className="ml-4 text-sm">Consultation Room</span>
          </div>
          <Button variant="destructive" onClick={() => setJoined(false)}>
            Leave Meeting
          </Button>
        </div>
        <div className="h-[calc(100vh-4rem)]">
          <JitsiMeetingComponent 
            roomName={roomId}
            displayName={patientName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Join Doctor Consultation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 rounded border">
            <p className="text-sm text-gray-600">Room ID:</p>
            <p className="font-mono font-semibold">{roomId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full p-3 border rounded"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && patientName.trim()) {
                  joinMeeting();
                }
              }}
            />
          </div>
          <Button 
            onClick={joinMeeting}
            disabled={!patientName.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Join Consultation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}