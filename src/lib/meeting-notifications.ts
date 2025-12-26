import { collection, doc, setDoc, onSnapshot, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface MeetingInvitation {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  roomId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: any;
  expiresAt: any;
}

// Send meeting invitation to patient
export const sendMeetingInvitation = async (
  doctorId: string,
  doctorName: string,
  patientId: string,
  patientName: string,
  roomId: string
): Promise<string> => {
  const invitationId = doc(collection(db, 'meetingInvitations')).id;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const invitation: Omit<MeetingInvitation, 'id'> = {
    doctorId,
    doctorName,
    patientId,
    patientName,
    roomId,
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt
  };

  await setDoc(doc(db, 'meetingInvitations', invitationId), invitation);
  return invitationId;
};

// Listen for meeting invitations (for patients)
export const listenForMeetingInvitations = (
  patientId: string,
  callback: (invitations: MeetingInvitation[]) => void
) => {
  const q = query(
    collection(db, 'meetingInvitations'),
    where('patientId', '==', patientId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const invitations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MeetingInvitation[];
    callback(invitations);
  });
};

// Accept meeting invitation
export const acceptMeetingInvitation = async (invitationId: string) => {
  await updateDoc(doc(db, 'meetingInvitations', invitationId), {
    status: 'accepted'
  });
};

// Decline meeting invitation
export const declineMeetingInvitation = async (invitationId: string) => {
  await updateDoc(doc(db, 'meetingInvitations', invitationId), {
    status: 'declined'
  });
};