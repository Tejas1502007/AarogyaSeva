"use client";

import { useState } from 'react';
import StartCall from '@/components/meeting/start-call';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CallTestPage() {
  const [userType, setUserType] = useState<'doctor' | 'patient'>('doctor');
  const [userName, setUserName] = useState('');

  if (!userName) {
    return (
      <div className="container mx-auto p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Join as Doctor or Patient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                variant={userType === 'doctor' ? 'default' : 'outline'}
                onClick={() => setUserType('doctor')}
              >
                Doctor
              </Button>
              <Button 
                variant={userType === 'patient' ? 'default' : 'outline'}
                onClick={() => setUserType('patient')}
              >
                Patient
              </Button>
            </div>
            <input 
              type="text"
              placeholder="Enter your name"
              className="w-full p-2 border rounded"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    setUserName(target.value.trim());
                  }
                }
              }}
            />
            <Button 
              className="w-full"
              onClick={() => {
                const input = document.querySelector('input') as HTMLInputElement;
                if (input?.value.trim()) {
                  setUserName(input.value.trim());
                }
              }}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold">One-to-One Video Call</h1>
        <p className="text-muted-foreground">
          Logged in as: <strong>{userType === 'doctor' ? 'Dr.' : ''} {userName}</strong>
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setUserName('')}
          className="mt-2"
        >
          Change User
        </Button>
      </div>
      
      <StartCall userType={userType} userName={userName} />
    </div>
  );
}