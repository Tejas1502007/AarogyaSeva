"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserMeetings, Meeting, createMeeting } from '@/lib/meeting-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Video, Plus, User, Search } from 'lucide-react';
import { format, isToday, isFuture, isPast } from 'date-fns';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function DoctorMeetings() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [meetingType, setMeetingType] = useState('consultation');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getUserMeetings(user.uid, 'doctor', (fetchedMeetings) => {
      setMeetings(fetchedMeetings);
      setLoading(false);
    });

    // Fetch patients
    const fetchPatients = async () => {
      const patientsQuery = query(collection(db, 'users'), where('role', '==', 'patient'));
      const snapshot = await getDocs(patientsQuery);
      const patientsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsList);
    };

    fetchPatients();
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
    const now = new Date();
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

  const handleCreateMeeting = async () => {
    if (!user || !selectedPatient || !meetingDate || !meetingTime) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields' });
      return;
    }

    try {
      const patient = patients.find(p => p.id === selectedPatient);
      const scheduledDateTime = new Date(`${meetingDate}T${meetingTime}`);
      
      await createMeeting(
        user.uid,
        selectedPatient,
        user.displayName || 'Doctor',
        patient?.displayName || patient?.name || 'Patient',
        scheduledDateTime,
        parseInt(duration),
        meetingType as any,
        notes
      );

      toast({ title: 'Success', description: 'Meeting scheduled successfully' });
      setIsCreateDialogOpen(false);
      
      // Reset form
      setSelectedPatient('');
      setMeetingDate('');
      setMeetingTime('');
      setDuration('30');
      setMeetingType('consultation');
      setNotes('');
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to schedule meeting' });
    }
  };

  const handleJoinMeeting = (meetingId: string) => {
    router.push(`/meeting/${meetingId}`);
  };

  const filteredMeetings = filterMeetings(meetings);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">Manage your video consultations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient">Patient</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.displayName || patient.name || patient.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={meetingType} onValueChange={setMeetingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Meeting notes..."
                />
              </div>
              <Button onClick={handleCreateMeeting} className="w-full">
                Schedule Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Meetings</CardTitle>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.map(meeting => (
                  <TableRow key={meeting.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Patient
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(meeting.scheduledTime.seconds * 1000), 'PPp')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {meeting.duration} min
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{meeting.meetingType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meeting.status === 'scheduled' && (
                        <Button
                          size="sm"
                          onClick={() => handleJoinMeeting(meeting.id)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Start Meeting
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}