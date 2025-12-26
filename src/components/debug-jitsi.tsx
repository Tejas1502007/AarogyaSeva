"use client";

import { useEffect, useRef, useState } from 'react';

export default function DebugJitsi() {
  const jitsiRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkJitsi = () => {
      // Check if script is loaded
      if ((window as any).JitsiMeetExternalAPI) {
        setStatus('✅ Jitsi script loaded');
        
        try {
          if (jitsiRef.current) {
            setStatus('✅ Creating meeting...');
            
            const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
              roomName: 'test-debug-' + Date.now(),
              width: '100%',
              height: '500px',
              parentNode: jitsiRef.current,
              userInfo: {
                displayName: 'Debug User'
              }
            });
            
            setStatus('✅ Meeting created successfully!');
          }
        } catch (err) {
          setError('❌ Error creating meeting: ' + err);
        }
      } else {
        setStatus('❌ Jitsi script not loaded');
        setTimeout(checkJitsi, 500);
      }
    };

    checkJitsi();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Jitsi Debug</h2>
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p><strong>Status:</strong> {status}</p>
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
        <p><strong>Script Available:</strong> {(window as any).JitsiMeetExternalAPI ? '✅ Yes' : '❌ No'}</p>
      </div>
      <div 
        ref={jitsiRef} 
        className="w-full h-[500px] border-2 border-blue-300 bg-blue-50 rounded"
      >
        <div className="flex items-center justify-center h-full text-gray-500">
          Meeting will load here...
        </div>
      </div>
    </div>
  );
}