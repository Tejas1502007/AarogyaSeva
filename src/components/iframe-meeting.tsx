"use client";

import { useState } from 'react';
import { Button } from './ui/button';

export default function IframeMeeting() {
  const [roomName] = useState('MedSeva-' + Date.now());
  const [showMeeting, setShowMeeting] = useState(false);

  if (!showMeeting) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold">Iframe Meeting Test</h2>
        <p>Room: {roomName}</p>
        <Button onClick={() => setShowMeeting(true)} className="w-full">
          Start Meeting (Iframe)
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Meeting: {roomName}</h2>
        <Button variant="outline" onClick={() => setShowMeeting(false)}>
          End Meeting
        </Button>
      </div>
      <iframe
        src={`https://meet.jit.si/${roomName}`}
        width="100%"
        height="600px"
        allow="camera; microphone; fullscreen; display-capture"
        className="border rounded"
      />
    </div>
  );
}