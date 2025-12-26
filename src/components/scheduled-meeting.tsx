"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Video, Clock, User, Calendar, AlertTriangle, Stethoscope } from 'lucide-react';
import { format, isWithinInterval, subMinutes, addMinutes } from 'date-fns';
import { sendMeetingInvitation } from '@/lib/meeting-notifications';

interface ScheduledAppointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentTime: { seconds: number; nanoseconds: number };
  mode: string;
  status: string;
  meetingStarted?: boolean;
  roomId?: string;
}

export default function ScheduledMeeting() {
  const { user, userRole } = useAuth();
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmergency, setShowEmergency] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [sendingEmergency, setSendingEmergency] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'appointments'),
      where(userRole === 'doctor' ? 'doctorId' : 'patientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Scheduled meetings query result:', snapshot.docs.length, 'appointments');
      const appointmentsList = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Appointment data:', data);
        return {
          id: doc.id,
          ...data
        };
      }) as ScheduledAppointment[];

      // Filter for online confirmed appointments
      const now = new Date();
      const relevantAppointments = appointmentsList.filter(apt => {
        const isOnline = apt.mode === 'Online' || apt.mode === 'online';
        const isConfirmed = apt.status === 'Confirmed';
        const aptTime = new Date(apt.appointmentTime.seconds * 1000);
        const isFuture = aptTime > subMinutes(now, 30);
        
        console.log('Filtering appointment:', {
          id: apt.id,
          mode: apt.mode,
          status: apt.status,
          isOnline,
          isConfirmed,
          isFuture,
          appointmentTime: aptTime
        });
        
        return isOnline && isConfirmed && isFuture;
      });

      console.log('Relevant appointments:', relevantAppointments);
      setAppointments(relevantAppointments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userRole]);

  const loadDoctors = async () => {
    try {
      const doctorsQuery = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const snapshot = await getDocs(doctorsQuery);
      const doctorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().displayName || doc.data().name || 'Dr. Unknown'
      }));
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const sendEmergencyRequest = async (doctorId: string, doctorName: string) => {
    if (!user || !emergencyMessage.trim()) return;
    
    setSendingEmergency(true);
    try {
      const roomId = `emergency-${Date.now()}`;
      
      // Create emergency meeting request
      await addDoc(collection(db, 'emergency-requests'), {
        patientId: user.uid,
        patientName: user.displayName || 'Patient',
        doctorId,
        doctorName,
        message: emergencyMessage,
        roomId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Send notification to doctor
      await addDoc(collection(db, 'notifications'), {
        userId: doctorId,
        title: 'Emergency Meeting Request',
        description: `${user.displayName || 'Patient'} needs emergency consultation: ${emergencyMessage}`,
        type: 'urgent',
        read: false,
        createdAt: serverTimestamp(),
        emergencyRoomId: roomId
      });
      
      setShowEmergency(false);
      setEmergencyMessage('');
      alert('Emergency request sent to doctor!');
    } catch (error) {
      console.error('Error sending emergency request:', error);
    } finally {
      setSendingEmergency(false);
    }
  };

  const canStartMeeting = (appointmentTime: { seconds: number; nanoseconds: number }) => {
    const now = new Date();
    const aptTime = new Date(appointmentTime.seconds * 1000);
    const startWindow = subMinutes(aptTime, 10); // 10 minutes before
    const endWindow = addMinutes(aptTime, 30); // 30 minutes after

    return isWithinInterval(now, { start: startWindow, end: endWindow });
  };

  const startScheduledMeeting = (appointment: ScheduledAppointment) => {
    const roomId = appointment.roomId || `scheduled-${appointment.id}`;
    
    // Trigger the embedded meeting component directly
    const event = new CustomEvent('startScheduledMeeting', {
      detail: { 
        roomId,
        patientId: appointment.patientId,
        patientName: appointment.patientName
      }
    });
    window.dispatchEvent(event);
  };

  const joinScheduledMeeting = (appointment: ScheduledAppointment) => {
    const roomId = appointment.roomId || `scheduled-${appointment.id}`;
    
    // Trigger the embedded meeting component directly
    const event = new CustomEvent('startScheduledMeeting', {
      detail: { roomId }
    });
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 animate-spin mr-2" />
            Loading scheduled meetings...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No scheduled online appointments found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Meetings
          </div>
          {userRole === 'patient' && (
            <Dialog open={showEmergency} onOpenChange={setShowEmergency}>
              <DialogTrigger asChild>
                <Button 
                  onClick={loadDoctors}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                  size="sm"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  EMERGENCY
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Emergency Meeting Request
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Emergency Message:</label>
                    <Textarea
                      placeholder="Describe your emergency situation..."
                      value={emergencyMessage}
                      onChange={(e) => setEmergencyMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Available Doctors:</label>
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {doctors.map((doctor) => (
                        <div key={doctor.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Stethoscope className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{doctor.name}</p>
                              <p className="text-sm text-muted-foreground">{doctor.specialization || 'General Medicine'}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => sendEmergencyRequest(doctor.id, doctor.name)}
                            disabled={!emergencyMessage.trim() || sendingEmergency}
                            className="bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                            {sendingEmergency ? 'Sending...' : 'Send Request'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => {
          const aptTime = new Date(appointment.appointmentTime.seconds * 1000);
          const canStart = canStartMeeting(appointment.appointmentTime);
          
          return (
            <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {userRole === 'doctor' ? appointment.patientName : `Dr. ${appointment.doctorName}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(aptTime, 'PPP p')}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Online
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {canStart ? (
                    <span className="text-green-600 font-medium">Ready to start</span>
                  ) : (
                    <span>
                      {aptTime > new Date() 
                        ? `Starts in ${Math.ceil((aptTime.getTime() - new Date().getTime()) / (1000 * 60))} minutes`
                        : 'Meeting time passed'
                      }
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => userRole === 'doctor' ? startScheduledMeeting(appointment) : joinScheduledMeeting(appointment)}
                  disabled={!canStart}
                  className={userRole === 'doctor' ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                >
                  <Video className="h-4 w-4 mr-2" />
                  {userRole === 'doctor' ? 'Start Meeting' : 'Join Meeting'}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}