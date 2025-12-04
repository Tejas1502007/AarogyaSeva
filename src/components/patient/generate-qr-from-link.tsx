
"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { QrCode, Link, Copy, Download, FileText, FileImage, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GenerateQrFromLink() {
  const [driveLink, setDriveLink] = useState("");
  const [recordType, setRecordType] = useState("");
  const [expiry, setExpiry] = useState("24");
  const [generatedData, setGeneratedData] = useState<{ qrCodeUrl: string; token: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!driveLink || !recordType) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a Google Drive link and select a record type.",
        });
        return;
    }
    // Basic validation for Google Drive link
    if (!driveLink.includes("drive.google.com")) {
        toast({
            variant: "destructive",
            title: "Invalid Link",
            description: "Please enter a valid Google Drive link.",
        });
        return;
    }
    
    setIsGenerating(true);
    // In a real app, you would:
    // 1. Send the driveLink, recordType, expiry, and user ID to your backend.
    // 2. The backend would create a secure, unique token.
    // 3. The backend stores the mapping: { token -> driveLink, owner, expiry, etc. }
    // 4. The backend returns the unique token to the frontend.
    // 5. The frontend generates a QR code for that token.
    // For now, we'll embed the link directly in the QR for demonstration.
    setTimeout(() => {
        const mockToken = `MED-SEVA-${Date.now().toString().slice(-6)}`;
        // We now embed the drive link directly for demonstration purposes.
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(driveLink)}`;

        setGeneratedData({
            qrCodeUrl: qrApiUrl,
            token: mockToken, // We still generate a token for display
        });
        setIsGenerating(false);
        toast({
            title: "Success!",
            description: "Your secure QR code and token have been generated.",
        });
    }, 1500);
  };

  const handleCopyToClipboard = () => {
    // We will copy the drive link itself for now, as the token is just a mock.
    if (driveLink) {
        navigator.clipboard.writeText(driveLink);
        toast({ title: "Copied!", description: "Link copied to clipboard." });
    }
  };

  const handleDownload = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!generatedData) return;

    if (format === 'pdf') {
      const printWindow = window.open(generatedData.qrCodeUrl);
      printWindow?.addEventListener('load', () => {
          printWindow.print();
      });
      return;
    }
  
    try {
      const response = await fetch(generatedData.qrCodeUrl);
      if (!response.ok) throw new Error('Network response was not ok.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `med-seva-qr.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the QR code. Please try again.",
      });
    }
  };

  const handleRevokeAccess = () => {
    setGeneratedData(null);
    setDriveLink("");
    setRecordType("");
    setExpiry("24");
    toast({
        title: "Access Revoked",
        description: "The QR code and link have been invalidated.",
    });
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <CardTitle>Generate QR from Drive Link</CardTitle>
        </div>
        <CardDescription>
          Paste a Google Drive link to your medical record to generate a secure QR code and token for sharing.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="drive-link" className="flex items-center gap-2">
                    <Link className="h-4 w-4" /> Google Drive Link
                </Label>
                <Input 
                    id="drive-link" 
                    placeholder="https://drive.google.com/file/d/..." 
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="record-type">Record Type</Label>
                    <Select value={recordType} onValueChange={setRecordType}>
                        <SelectTrigger id="record-type">
                            <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lab-results">Lab Results</SelectItem>
                            <SelectItem value="dicom-image">DICOM Image</SelectItem>
                            <SelectItem value="prescription">Prescription</SelectItem>
                            <SelectItem value="consultation-notes">Consultation Notes</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry (hours)</Label>
                    <Input 
                        id="expiry" 
                        type="number" 
                        placeholder="24"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                    />
                </div>
            </div>
             <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? "Generating..." : "Generate QR & Token"}
            </Button>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed bg-muted/50 p-6">
            {generatedData ? (
                <>
                    <div className="rounded-lg border bg-white p-2 shadow-md">
                        <Image
                            src={generatedData.qrCodeUrl}
                            alt="Generated QR Code"
                            width={150}
                            height={150}
                            data-ai-hint="qr code"
                        />
                    </div>
                    <div className="flex w-full items-center space-x-2">
                        <Input value={generatedData.token} readOnly placeholder="Secure Token" />
                        <Button variant="outline" size="icon" onClick={handleCopyToClipboard} title="Copy Link">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center text-muted-foreground">
                    <QrCode className="mx-auto h-16 w-16" />
                    <p className="mt-2">Your QR code will appear here</p>
                </div>
            )}
        </div>
      </CardContent>
       {generatedData && (
        <CardFooter className="flex-col items-start gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Download QR Code As:</p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload('png')}><FileDown className="mr-2 h-4 w-4" /> PNG</Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload('jpg')}><FileImage className="mr-2 h-4 w-4" /> JPG</Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}><FileText className="mr-2 h-4 w-4" /> PDF</Button>
            </div>
            <Button variant="destructive" size="sm" onClick={handleRevokeAccess}>Revoke Access</Button>
        </CardFooter>
      )}
    </Card>
  );
}
