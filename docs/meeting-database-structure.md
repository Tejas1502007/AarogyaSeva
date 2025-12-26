# Meeting Database Structure

## Collections

### 1. meetings
```javascript
{
  id: "meeting_123",
  doctorId: "doctor_uid",
  patientId: "patient_uid",
  roomName: "medseva_dr_john_pt_alice_1234567890",
  scheduledTime: Timestamp,
  duration: 30, // minutes
  status: "scheduled" | "ongoing" | "completed" | "cancelled",
  meetingType: "consultation" | "follow-up" | "emergency",
  notes: "Patient follow-up for diabetes",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  doctorJoined: false,
  patientJoined: false,
  startedAt: null,
  endedAt: null
}
```

### 2. appointments (existing - add meeting reference)
```javascript
{
  // existing fields...
  meetingId: "meeting_123", // reference to meeting
  mode: "Online" | "In-Person"
}
```