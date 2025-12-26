"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, Copy } from 'lucide-react';
import JitsiMeetingComponent from '@/components/jitsi-meeting';

export default function DoctorMeeting() {
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [doctorName, setDoctorName] = useState('');

  const startMeeting = () => {
    if (doctorName.trim()) {
      const newRoomId = 'dr-' + Date.now();
      setRoomId(newRoomId);
      setMeetingStarted(true);
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/patient-join/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Patient link copied! Share this with your patient.');
  };

  if (meetingStarted) {
    return (
      <div className="h-screen">
        <div className="h-16 bg-blue-600 text-white flex items-center justify-between px-4">
          <div>
            <span className="font-semibold">Dr. {doctorName}</span>
            <span className="ml-4 text-sm">Room: {roomId}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyRoomLink} className="text-blue-600 border-white">
              <Copy className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button variant="destructive" onClick={() => setMeetingStarted(false)}>
              End Meeting
            </Button>
          </div>
        </div>
        <div className="h-[calc(100vh-4rem)]">
          <JitsiMeetingComponent 
            roomName={roomId}
            displayName={`Dr. ${doctorName}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            Start Doctor Meeting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Doctor Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full p-3 border rounded"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && doctorName.trim()) {
                  startMeeting();
                }
              }}
            />
          </div>
          <Button 
            onClick={startMeeting}
            disabled={!doctorName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Video className="h-4 w-4 mr-2" />
            Start Meeting & Get Patient Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}