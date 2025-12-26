import { collection, doc, setDoc, serverTimestamp, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { generateRoomName } from './meeting-utils';

export interface EmergencyCall {
  id: string;
  patientId: string;
  patientName: string;
  roomName: string;
  status: 'waiting' | 'connected' | 'ended';
  createdAt: any;
  doctorId?: string;
  doctorName?: string;
  connectedAt?: any;
}

// Create emergency call
export const createEmergencyCall = async (
  patientId: string,
  patientName: string
): Promise<string> => {
  const callId = doc(collection(db, 'emergencyCalls')).id;
  const roomName = generateRoomName('emergency', patientName);
  
  const callData: Omit<EmergencyCall, 'id'> = {
    patientId,
    patientName,
    roomName,
    status: 'waiting',
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, 'emergencyCalls', callId), callData);
  return callId;
};

// Listen for available doctors
export const listenForAvailableDoctors = (callback: (doctors: any[]) => void) => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'doctor'),
    where('isOnline', '==', true)
  );
  
  return onSnapshot(q, (snapshot) => {
    const doctors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(doctors);
  });
};

// Listen for emergency calls (for doctors)
export const listenForEmergencyCalls = (callback: (calls: EmergencyCall[]) => void) => {
  const q = query(
    collection(db, 'emergencyCalls'),
    where('status', '==', 'waiting'),
    limit(10)
  );
  
  return onSnapshot(q, (snapshot) => {
    const calls = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EmergencyCall[];
    
    // Sort by createdAt in JavaScript
    calls.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    
    callback(calls);
  });
};