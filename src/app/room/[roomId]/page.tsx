"use client";

import { useParams } from 'next/navigation';
import { useState } from 'react';
import JitsiMeetingComponent from '@/components/jitsi-meeting';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-6 text-center">Join Meeting</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room ID</label>
              <input 
                type="text" 
                value={roomId} 
                disabled 
                className="w-full p-3 border rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input 
                type="text" 
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-3 border rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userName.trim()) {
                    setJoined(true);
                  }
                }}
              />
            </div>
            <button 
              onClick={() => userName.trim() && setJoined(true)}
              disabled={!userName.trim()}
              className="w-full bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              Join Meeting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black">
      <JitsiMeetingComponent 
        roomName={roomId}
        displayName={userName}
        onApiReady={(api) => {
          console.log('Meeting joined:', roomId);
        }}
      />
    </div>
  );
}