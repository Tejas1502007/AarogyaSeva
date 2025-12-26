"use client";

import { useState, useEffect } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Video, X, Copy, Users, Send, Phone } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendMeetingInvitation } from '@/lib/meeting-notifications';
import { useAuth } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';

interface EmbeddedMeetingProps {
  userType: 'doctor' | 'patient';
  userName: string;
}

export default function EmbeddedMeeting({ userType, userName }: EmbeddedMeetingProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [showMeeting, setShowMeeting] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');

  useEffect(() => {
    if (userType === 'doctor') {
      fetchPatients();
    }
    
    // Auto-join if room ID is in URL (from invitation or scheduled meeting)
    const joinRoom = searchParams.get('join');
    if (joinRoom) {
      setRoomId(joinRoom);
      setShowMeeting(true);
    }

    // Listen for scheduled meeting events
    const handleScheduledMeeting = (event: CustomEvent) => {
      const { roomId, patientId, patientName } = event.detail;
      setRoomId(roomId);
      setShowMeeting(true);
      
      // Send invitation if doctor is starting the meeting
      if (userType === 'doctor' && patientId && patientName && user) {
        sendMeetingInvitation(
          user.uid,
          user.displayName || 'Doctor',
          patientId,
          patientName,
          roomId
        ).catch(console.error);
      }
    };

    window.addEventListener('startScheduledMeeting', handleScheduledMeeting as EventListener);
    return () => window.removeEventListener('startScheduledMeeting', handleScheduledMeeting as EventListener);
  }, [userType, searchParams]);

  const fetchPatients = async () => {
    const patientsQuery = query(collection(db, 'users'), where('role', '==', 'patient'));
    const snapshot = await getDocs(patientsQuery);
    const patientsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPatients(patientsList);
  };

  const startMeeting = () => {
    const newRoomId = `${userType}-${Date.now()}`;
    setRoomId(newRoomId);
    setStep(2);
  };

  const invitePatient = async () => {
    if (!selectedPatient || !user) return;
    
    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return;

    try {
      await sendMeetingInvitation(
        user.uid,
        userName,
        selectedPatient,
        patient.displayName || patient.name || 'Patient',
        roomId
      );
      alert(`Invitation sent to ${patient.displayName || patient.name}!`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    }
  };

  const joinMeeting = () => {
    if (joinRoomId.trim()) {
      setRoomId(joinRoomId);
      setShowMeeting(true);
    }
  };

  const startMeetingDirect = (roomId: string) => {
    setRoomId(roomId);
    setShowMeeting(true);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied! Share with patient.');
  };

  if (showMeeting) {
    return (
      <div className="h-[600px] relative">
        <div className="absolute top-4 right-4 z-50">
          <Button 
            variant="destructive" 
            size="lg"
            onClick={() => {
              setShowMeeting(false);
              setStep(1);
              setRoomId('');
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full shadow-lg"
          >
            <Phone className="h-5 w-5 mr-2" />
            End Call
          </Button>
        </div>
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomId}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            requireDisplayName: false,
          }}
          interfaceConfigOverwrite={{
            SHOW_JITSI_WATERMARK: false,
            APP_NAME: 'Arogya Seva',
          }}
          userInfo={{
            displayName: userName
          }}
          onApiReady={(api) => {
            console.log('Jitsi API ready - allowing natural authentication flow');
          }}
          getIFrameRef={(ref) => {
            if (ref) {
              ref.style.height = '600px';
              ref.style.width = '100%';
              ref.style.borderRadius = '8px';
            }
          }}
        />
      </div>
    );
  }

  if (step === 2 && userType === 'doctor') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meeting Created</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <p className="font-medium mb-2">Room ID:</p>
            <div className="flex items-center gap-2">
              <code className="bg-white p-2 rounded border flex-1">{roomId}</code>
              <Button size="sm" onClick={copyRoomId}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Invite Patient:</label>
              <select 
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.displayName || patient.name || patient.email}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedPatient && (
              <Button onClick={invitePatient} className="w-full bg-blue-600">
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            )}
            
            <p className="text-sm text-gray-600">
              Or share Room ID manually: <code className="bg-gray-100 px-1 rounded">{roomId}</code>
            </p>
          </div>
          
          <Button onClick={() => setShowMeeting(true)} className="w-full">
            <Video className="h-4 w-4 mr-2" />
            Join Meeting
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-meeting-component>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Meeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userType === 'doctor' ? (
          <Button onClick={startMeeting} className="w-full">
            <Video className="h-4 w-4 mr-2" />
            Start New Meeting
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Room ID (from doctor):
              </label>
              <input
                type="text"
                placeholder="Enter room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="w-full p-3 border rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    joinMeeting();
                  }
                }}
              />
            </div>
            <Button 
              onClick={joinMeeting} 
              disabled={!joinRoomId.trim()}
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}