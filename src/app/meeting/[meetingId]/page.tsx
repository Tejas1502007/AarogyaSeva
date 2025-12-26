"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import OneToOneCall from '@/components/meeting/one-to-one-call';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Meeting } from '@/lib/meeting-utils';
import { format } from 'date-fns';

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');

  useEffect(() => {
    if (!user || !params.meetingId) return;

    const fetchMeeting = async () => {
      try {
        const meetingDoc = await getDoc(doc(db, 'meetings', params.meetingId as string));
        
        if (!meetingDoc.exists()) {
          setError('Meeting not found');
          return;
        }

        const meetingData = { id: meetingDoc.id, ...meetingDoc.data() } as Meeting;
        
        if (meetingData.doctorId !== user.uid && meetingData.patientId !== user.uid) {
          setError('You are not authorized to join this meeting');
          return;
        }

        setMeeting(meetingData);

        const otherUserId = userRole === 'doctor' ? meetingData.patientId : meetingData.doctorId;
        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        if (otherUserDoc.exists()) {
          const userData = otherUserDoc.data();
          setOtherUserName(userData.displayName || userData.name || 'Unknown User');
        }

      } catch (err) {
        console.error('Error fetching meeting:', err);
        setError('Failed to load meeting');
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [user, params.meetingId, userRole]);

  const handleMeetingEnd = () => {
    router.push(`/${userRole}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009688]"></div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{error || 'Meeting not found'}</p>
            <Button onClick={() => router.push(`/${userRole}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {userRole === 'doctor' ? `Consultation with ${otherUserName}` : `Consultation with Dr. ${otherUserName}`}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(meeting.scheduledTime.seconds * 1000), 'PPP')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(meeting.scheduledTime.seconds * 1000), 'p')}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {meeting.meetingType}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push(`/${userRole}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <OneToOneCall
        roomId={meeting.roomName}
        doctorName={userRole === 'doctor' ? (user?.displayName || 'Doctor') : otherUserName}
        patientName={userRole === 'patient' ? (user?.displayName || 'Patient') : otherUserName}
        userType={userRole as 'doctor' | 'patient'}
        onCallEnd={handleMeetingEnd}
      />
    </div>
  );
}