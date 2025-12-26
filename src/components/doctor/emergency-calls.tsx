"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { listenForEmergencyCalls, EmergencyCall } from '@/lib/emergency-call';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function DoctorEmergencyCalls() {
  const { user } = useAuth();
  const router = useRouter();
  const [emergencyCalls, setEmergencyCalls] = useState<EmergencyCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenForEmergencyCalls((calls) => {
      setEmergencyCalls(calls);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleJoinCall = (callId: string) => {
    router.push(`/emergency/${callId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Emergency Calls
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : emergencyCalls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No emergency calls waiting</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emergencyCalls.map(call => (
              <Card key={call.id} className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-red-600" />
                        <span className="font-semibold">{call.patientName}</span>
                        <Badge className="bg-red-100 text-red-800 animate-pulse">
                          Emergency
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Waiting for {formatDistanceToNow(new Date(call.createdAt.seconds * 1000))}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinCall(call.id)}
                      className="bg-red-600 hover:bg-red-700 animate-pulse"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Answer Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}