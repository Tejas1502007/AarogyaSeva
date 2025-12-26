"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Video, Users, Plus, Copy } from 'lucide-react';

export default function MeetingInterface() {
  const [roomId, setRoomId] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const generateRoomId = () => {
    return 'medseva-' + Math.random().toString(36).substr(2, 9);
  };

  const createRoom = () => {
    const newRoomId = generateRoomId();
    window.open(`/room/${newRoomId}`, '_blank');
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      window.open(`/room/${roomId}`, '_blank');
    }
  };

  const copyRoomLink = (id: string) => {
    const link = `${window.location.origin}/room/${id}`;
    navigator.clipboard.writeText(link);
    alert('Room link copied!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">MedSeva Video Meetings</h1>
          <p className="text-xl text-gray-600">Connect with doctors and patients securely</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create Meeting */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Start New Meeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Create an instant meeting room</p>
              <Button onClick={createRoom} className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Button>
            </CardContent>
          </Card>

          {/* Join Meeting */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Join Meeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-3 border rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    joinRoom();
                  }
                }}
              />
              <Button 
                onClick={joinRoom} 
                disabled={!roomId.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Join Meeting
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Rooms */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {['emergency-room', 'consultation-1', 'consultation-2'].map((room) => (
                <div key={room} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{room}</p>
                    <p className="text-sm text-gray-600">Ready to join</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyRoomLink(room)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => window.open(`/room/${room}`, '_blank')}
                    >
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}