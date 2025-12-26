import { collection, doc, setDoc, getDoc, updateDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Meeting {
  id: string;
  doctorId: string;
  patientId: string;
  roomName: string;
  scheduledTime: any;
  duration: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingType: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
  createdAt: any;
  updatedAt: any;
  doctorJoined: boolean;
  patientJoined: boolean;
  startedAt?: any;
  endedAt?: any;
}

// Generate unique room name
export const generateRoomName = (doctorName: string, patientName: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const cleanDoctorName = doctorName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPatientName = patientName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `medseva_dr_${cleanDoctorName}_pt_${cleanPatientName}_${timestamp}_${random}`;
};

// Create new meeting
export const createMeeting = async (
  doctorId: string,
  patientId: string,
  doctorName: string,
  patientName: string,
  scheduledTime: Date,
  duration: number = 30,
  meetingType: 'consultation' | 'follow-up' | 'emergency' = 'consultation',
  notes?: string
): Promise<string> => {
  const meetingId = doc(collection(db, 'meetings')).id;
  const roomName = generateRoomName(doctorName, patientName);
  
  const meetingData: Omit<Meeting, 'id'> = {
    doctorId,
    patientId,
    roomName,
    scheduledTime,
    duration,
    status: 'scheduled',
    meetingType,
    notes: notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    doctorJoined: false,
    patientJoined: false
  };

  await setDoc(doc(db, 'meetings', meetingId), meetingData);
  return meetingId;
};

// Join meeting
export const joinMeeting = async (meetingId: string, userId: string, userType: 'doctor' | 'patient'): Promise<void> => {
  const meetingRef = doc(db, 'meetings', meetingId);
  const updateData: any = {
    updatedAt: serverTimestamp()
  };

  if (userType === 'doctor') {
    updateData.doctorJoined = true;
  } else {
    updateData.patientJoined = true;
  }

  // If this is the first person joining, mark meeting as ongoing
  const meetingDoc = await getDoc(meetingRef);
  if (meetingDoc.exists()) {
    const data = meetingDoc.data();
    if (!data.doctorJoined && !data.patientJoined) {
      updateData.status = 'ongoing';
      updateData.startedAt = serverTimestamp();
    }
  }

  await updateDoc(meetingRef, updateData);
};

// End meeting
export const endMeeting = async (meetingId: string): Promise<void> => {
  await updateDoc(doc(db, 'meetings', meetingId), {
    status: 'completed',
    endedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Get user meetings
export const getUserMeetings = (userId: string, userType: 'doctor' | 'patient', callback: (meetings: Meeting[]) => void) => {
  const field = userType === 'doctor' ? 'doctorId' : 'patientId';
  const q = query(collection(db, 'meetings'), where(field, '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const meetings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meeting[];
    callback(meetings);
  });
};