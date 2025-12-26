"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  listenForMeetingInvitations, 
  acceptMeetingInvitation, 
  declineMeetingInvitation,
  MeetingInvitation 
} from '@/lib/meeting-notifications';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Video, Check, X, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MeetingInvitationListener() {
  const { user, userRole } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<MeetingInvitation[]>([]);

  useEffect(() => {
    if (!user || userRole !== 'patient') return;

    const unsubscribe = listenForMeetingInvitations(user.uid, (newInvitations) => {
      setInvitations(newInvitations);
    });

    return () => unsubscribe();
  }, [user, userRole]);

  const handleAccept = async (invitation: MeetingInvitation) => {
    await acceptMeetingInvitation(invitation.id);
    // Navigate to meeting page with room ID
    router.push(`/patient/meetings?join=${invitation.roomId}`);
  };

  const handleDecline = async (invitation: MeetingInvitation) => {
    await declineMeetingInvitation(invitation.id);
  };

  if (invitations.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="w-80 border-blue-200 bg-blue-50 shadow-lg animate-pulse">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Video className="h-5 w-5" />
              Meeting Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">Dr. {invitation.doctorName}</p>
              <p className="text-sm text-gray-600">has started a meeting and invited you to join</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Expires in 5 minutes</span>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleAccept(invitation)}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Check className="h-4 w-4 mr-1" />
                Join Now
              </Button>
              <Button 
                onClick={() => handleDecline(invitation)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}