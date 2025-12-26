"use client";

import { Button } from './ui/button';

export default function JitsiDirect() {
  const roomName = 'MedSeva-Test-' + Math.random().toString(36).substr(2, 9);
  
  const openJitsiMeeting = () => {
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    window.open(jitsiUrl, '_blank', 'width=1200,height=800');
  };

  const embedJitsi = () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://meet.jit.si/${roomName}`;
    iframe.width = '100%';
    iframe.height = '600px';
    iframe.allow = 'camera; microphone; fullscreen; display-capture';
    
    const container = document.getElementById('jitsi-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(iframe);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold">Room: {roomName}</h3>
        <p>Choose how to join the meeting:</p>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={openJitsiMeeting} className="bg-blue-600">
          Open in New Window
        </Button>
        <Button onClick={embedJitsi} className="bg-green-600">
          Embed Here
        </Button>
      </div>
      
      <div 
        id="jitsi-container" 
        className="w-full h-[600px] border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500"
      >
        Click "Embed Here" to load meeting
      </div>
    </div>
  );
}