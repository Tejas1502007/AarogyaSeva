"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import JitsiMeet from '@/components/meeting/jitsi-meet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Phone } from 'lucide-react';
import { EmergencyCall } from '@/lib/emergency-call';

export default function EmergencyCallPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [call, setCall] = useState<EmergencyCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [waitingTime, setWaitingTime] = useState(0);

  useEffect(() => {
    if (!user || !params.callId) return;

    const callRef = doc(db, 'emergencyCalls', params.callId as string);
    
    const unsubscribe = onSnapshot(callRef, (doc) => {
      if (doc.exists()) {
        const callData = { id: doc.id, ...doc.data() } as EmergencyCall;
        setCall(callData);
        
        if (userRole === 'doctor' && callData.status === 'waiting') {
          // Doctor joining - update call status
          updateDoc(callRef, {
            status: 'connected',
            doctorId: user.uid,
            doctorName: user.displayName || 'Doctor',
            connectedAt: new Date()
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, params.callId, userRole]);

  useEffect(() => {
    if (call?.status === 'waiting') {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - call.createdAt.seconds * 1000) / 1000);
        setWaitingTime(elapsed);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [call]);

  const handleEndCall = () => {
    router.push(`/${userRole}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Call Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/${userRole}`)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (call.status === 'waiting') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              Emergency Call - Waiting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="animate-pulse">
                <Phone className="h-16 w-16 mx-auto text-red-600 mb-4" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connecting to Doctor...</h3>
              <p className="text-muted-foreground mb-4">
                Please wait while we connect you to an available doctor.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Waiting: {Math.floor(waitingTime / 60)}:{(waitingTime % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleEndCall}
              className="w-full"
            >
              Cancel Call
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h1 className="text-xl font-bold text-red-600">Emergency Consultation</h1>
              {call.doctorName && (
                <span className="text-muted-foreground">with {call.doctorName}</span>
              )}
            </div>
            <Button variant="destructive" onClick={handleEndCall}>
              End Call
            </Button>
          </div>
        </CardContent>
      </Card>

      <JitsiMeet
        roomName={call.roomName}
        meetingId={call.id}
        userType={userRole as 'doctor' | 'patient'}
        displayName={user?.displayName || user?.email || 'User'}
        onMeetingEnd={handleEndCall}
      />
    </div>
  );
}