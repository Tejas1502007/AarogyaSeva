"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { createEmergencyCall } from '@/lib/emergency-call';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function EmergencyCallButton() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleEmergencyCall = () => {
    if (!user) return;
    
    // Redirect directly to video meeting
    router.push('/patient/meetings');
  };

  return (
    <>
      <Button
        onClick={handleEmergencyCall}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg"
        size="lg"
      >
        <Phone className="h-5 w-5 mr-2" />
        Emergency Call
      </Button>


    </>
  );
}