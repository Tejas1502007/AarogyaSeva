"use client";

import { useState } from 'react';
import SimpleMeeting from '@/components/simple-meeting';
import { Button } from '@/components/ui/button';

export default function MeetPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'doctor' | 'patient'>('doctor');
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <h1 className="text-3xl font-bold text-center">MedSeva Video Call</h1>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">I am a:</p>
              <div className="flex gap-2">
                <Button 
                  variant={userType === 'doctor' ? 'default' : 'outline'}
                  onClick={() => setUserType('doctor')}
                  className="flex-1"
                >
                  Doctor
                </Button>
                <Button 
                  variant={userType === 'patient' ? 'default' : 'outline'}
                  onClick={() => setUserType('patient')}
                  className="flex-1"
                >
                  Patient
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Your Name:</label>
              <input 
                type="text"
                placeholder={userType === 'doctor' ? 'Dr. Smith' : 'John Doe'}
                className="w-full p-3 border rounded"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Room Name:</label>
              <input 
                type="text"
                placeholder="Enter room name or leave blank for random"
                className="w-full p-3 border rounded"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>

            <Button 
              onClick={() => {
                if (userName.trim()) {
                  if (!roomName.trim()) {
                    setRoomName('MedSeva-' + Date.now());
                  }
                  setStep(2);
                }
              }}
              className="w-full"
              disabled={!userName.trim()}
            >
              Join Video Call
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {userType === 'doctor' ? 'Dr.' : ''} {userName}
            </h1>
            <p className="text-muted-foreground">Room: {roomName}</p>
          </div>
          <Button variant="outline" onClick={() => setStep(1)}>
            Leave Call
          </Button>
        </div>
        
        <SimpleMeeting 
          roomName={roomName} 
          userName={userType === 'doctor' ? `Dr. ${userName}` : userName} 
        />
      </div>
    </div>
  );
}