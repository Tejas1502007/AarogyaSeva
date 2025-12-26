"use client";

import { useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

export default function MeetNowPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'doctor' | 'patient'>('doctor');
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">MedSeva Video Call</h1>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">I am a:</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setUserType('doctor')}
                  className={`flex-1 p-3 rounded ${userType === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Doctor
                </button>
                <button 
                  onClick={() => setUserType('patient')}
                  className={`flex-1 p-3 rounded ${userType === 'patient' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                >
                  Patient
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Your Name:</label>
              <input 
                type="text"
                placeholder={userType === 'doctor' ? 'Dr. Smith' : 'John Doe'}
                className="w-full p-3 border rounded"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            {userType === 'patient' && (
              <div>
                <label className="block font-medium mb-1">Room ID (from doctor):</label>
                <input 
                  type="text"
                  placeholder="Enter room ID"
                  className="w-full p-3 border rounded"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                />
              </div>
            )}

            <button 
              onClick={() => {
                if (userName.trim()) {
                  if (userType === 'doctor') {
                    setRoomId('dr-' + Date.now());
                  } else {
                    setRoomId(joinRoomId || 'patient-' + Date.now());
                  }
                  setStep(2);
                }
              }}
              disabled={!userName.trim() || (userType === 'patient' && !joinRoomId.trim())}
              className="w-full bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {userType === 'doctor' ? 'Start Meeting' : 'Join Meeting'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2 && userType === 'doctor') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Meeting Created!</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <p className="font-medium">Room ID:</p>
              <p className="text-lg font-mono">{roomId}</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="font-medium">Share this Room ID with patient:</p>
              <p className="text-lg font-mono bg-white p-2 rounded border">{roomId}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  alert('Room ID copied!');
                }}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded text-sm"
              >
                Copy Room ID
              </button>
            </div>
            <button 
              onClick={() => setStep(3)}
              className="w-full bg-blue-600 text-white p-3 rounded font-medium"
            >
              Join Meeting Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div className="h-16 bg-gray-800 text-white flex items-center justify-between px-4">
        <div>
          <span className="font-semibold">{userName}</span>
          <span className="ml-4 text-sm">Room: {roomId}</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 px-4 py-2 rounded"
        >
          End Call
        </button>
      </div>
      <div className="h-[calc(100vh-4rem)]">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomId}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
          }}
          userInfo={{
            displayName: userName
          }}
          getIFrameRef={(ref) => {
            if (ref) {
              ref.style.height = '100%';
              ref.style.width = '100%';
            }
          }}
        />
      </div>
    </div>
  );
}