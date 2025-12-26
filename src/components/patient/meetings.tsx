"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserMeetings, Meeting } from '@/lib/meeting-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, User, Phone } from 'lucide-react';
import { format, isToday, isFuture, isPast } from 'date-fns';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PatientMeetings() {
  const { user } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [doctorNames, setDoctorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getUserMeetings(user.uid, 'patient', async (fetchedMeetings) => {
      setMeetings(fetchedMeetings);
      
      // Fetch doctor names
      const doctorIds = [...new Set(fetchedMeetings.map(m => m.doctorId))];
      const names: Record<string, string> = {};
      
      for (const doctorId of doctorIds) {
        try {
          const doctorDoc = await getDoc(doc(db, 'users', doctorId));
          if (doctorDoc.exists()) {
            const data = doctorDoc.data();
            names[doctorId] = data.displayName || data.name || 'Dr. Unknown';
          }
        } catch (error) {
          console.error('Error fetching doctor:', error);
          names[doctorId] = 'Dr. Unknown';
        }
      }
      
      setDoctorNames(names);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterMeetings = (meetings: Meeting[]) => {
    switch (activeTab) {
      case 'today':
        return meetings.filter(m => isToday(new Date(m.scheduledTime.seconds * 1000)));
      case 'upcoming':
        return meetings.filter(m => isFuture(new Date(m.scheduledTime.seconds * 1000)));
      case 'past':
        return meetings.filter(m => isPast(new Date(m.scheduledTime.seconds * 1000)));
      default:
        return meetings;
    }
  };

  const handleJoinMeeting = (meetingId: string) => {
    router.push(`/meeting/${meetingId}`);
  };

  const filteredMeetings = filterMeetings(meetings);
  const upcomingMeeting = meetings.find(m => 
    m.status === 'scheduled' && isFuture(new Date(m.scheduledTime.seconds * 1000))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Meetings</h1>
        <p className="text-muted-foreground">Your scheduled video consultations</p>
      </div>

      {/* Next Meeting Card */}
      {upcomingMeeting && (
        <Card className="border-[#009688] bg-gradient-to-r from-[#E0F2F1] to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#00796B]">
              <Video className="h-5 w-5" />
              Next Meeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Consultation with {doctorNames[upcomingMeeting.doctorId] || 'Doctor'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(upcomingMeeting.scheduledTime.seconds * 1000), 'PPP')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(upcomingMeeting.scheduledTime.seconds * 1000), 'p')}
                  </div>
                  <Badge variant="outline">{upcomingMeeting.meetingType}</Badge>
                </div>
                {upcomingMeeting.notes && (
                  <p className="text-sm text-muted-foreground">{upcomingMeeting.notes}</p>
                )}
              </div>
              <Button
                size="lg"
                onClick={() => handleJoinMeeting(upcomingMeeting.id)}
                className="bg-[#009688] hover:bg-[#00796B]"
              >
                <Video className="h-4 w-4 mr-2" />
                Join Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Meetings</CardTitle>
            <div className="flex gap-2">
              {['today', 'upcoming', 'past'].map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009688]"></div>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No meetings found for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map(meeting => (
                <Card key={meeting.id} className="border-l-4 border-l-[#009688]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#009688]" />
                          <h3 className="font-semibold">
                            {doctorNames[meeting.doctorId] || 'Doctor'}
                          </h3>
                          <Badge className={getStatusBadge(meeting.status)}>
                            {meeting.status}
                          </Badge>
                        </div>
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
                            <Clock className="h-4 w-4" />
                            {meeting.duration} minutes
                          </div>
                          <Badge variant="outline">{meeting.meetingType}</Badge>
                        </div>
                        {meeting.notes && (
                          <p className="text-sm text-muted-foreground">{meeting.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {meeting.status === 'scheduled' && (
                          <Button
                            onClick={() => handleJoinMeeting(meeting.id)}
                            className="bg-[#009688] hover:bg-[#00796B]"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}