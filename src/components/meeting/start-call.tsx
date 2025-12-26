"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Video, Phone } from 'lucide-react';
import OneToOneCall from './one-to-one-call';

interface StartCallProps {
  userType: 'doctor' | 'patient';
  userName: string;
}

export default function StartCall({ userType, userName }: StartCallProps) {
  const [isInCall, setIsInCall] = useState(false);
  const [callData, setCallData] = useState({
    roomId: '',
    doctorName: '',
    patientName: '',
    otherUserName: ''
  });

  const generateRoomId = () => {
    return `medseva-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const startCall = (otherUserName: string) => {
    const roomId = generateRoomId();
    setCallData({
      roomId,
      doctorName: userType === 'doctor' ? userName : otherUserName,
      patientName: userType === 'patient' ? userName : otherUserName,
      otherUserName
    });
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
    setCallData({ roomId: '', doctorName: '', patientName: '', otherUserName: '' });
  };

  if (isInCall) {
    return (
      <OneToOneCall
        roomId={callData.roomId}
        doctorName={callData.doctorName}
        patientName={callData.patientName}
        userType={userType}
        onCallEnd={endCall}
      />
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Start Video Call
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">
            {userType === 'doctor' ? 'Patient Name:' : 'Doctor Name:'}
          </label>
          <Input 
            placeholder={userType === 'doctor' ? 'Enter patient name' : 'Enter doctor name'}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  startCall(target.value.trim());
                }
              }
            }}
          />
        </div>
        <Button 
          className="w-full" 
          onClick={() => {
            const input = document.querySelector('input') as HTMLInputElement;
            if (input?.value.trim()) {
              startCall(input.value.trim());
            }
          }}
        >
          <Phone className="h-4 w-4 mr-2" />
          Start Call
        </Button>
      </CardContent>
    </Card>
  );
}