"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PhoneOff } from 'lucide-react';
import JitsiFixed from '../jitsi-fixed';

interface OneToOneCallProps {
  roomId: string;
  doctorName: string;
  patientName: string;
  userType: 'doctor' | 'patient';
  onCallEnd: () => void;
}

export default function OneToOneCall({ roomId, doctorName, patientName, userType, onCallEnd }: OneToOneCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  
  const displayName = userType === 'doctor' ? `Dr. ${doctorName}` : patientName;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">
                {userType === 'doctor' 
                  ? `Consultation with ${patientName}` 
                  : `Consultation with Dr. ${doctorName}`
                }
              </h3>
              <p className="text-sm text-muted-foreground">
                Room: {roomId}
              </p>
            </div>
            <Button variant="destructive" onClick={onCallEnd}>
              <PhoneOff className="h-4 w-4 mr-2" />
              End Call
            </Button>
          </div>
        </CardContent>
      </Card>

      <JitsiFixed
        roomName={roomId}
        displayName={displayName}
        onJoin={() => setIsConnected(true)}
        onLeave={onCallEnd}
      />
    </div>
  );
}