
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, UploadCloud, Link, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

export default function ScanToken() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [decodedLink, setDecodedLink] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState("Searching for QR code...");

  useEffect(() => {
    const getCameraPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
          setHasCameraPermission(false);
        }
      } else {
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const scanQRCode = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            setDecodedLink(code.data);
            setScanStatus("QR Code Found!");
            toast({ title: "QR Code Detected!", description: "Link has been extracted from the camera feed." });
            return; // Stop scanning
          } else {
             setScanStatus("Searching for QR code...");
          }
        }
      }
      animationFrameId = requestAnimationFrame(scanQRCode);
    };

    if (hasCameraPermission && !decodedLink) {
        animationFrameId = requestAnimationFrame(scanQRCode);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasCameraPermission, decodedLink, toast]);


  const decodeQrFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const image = new window.Image();
        image.src = e.target?.result as string;
        image.onload = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (context) {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        setDecodedLink(code.data);
                        toast({ title: "QR Code Decoded!", description: "Link extracted from uploaded image." });
                    } else {
                        toast({ variant: "destructive", title: "Decoding Failed", description: "No QR code found in the image." });
                    }
                }
            }
        };
    };
    reader.readAsDataURL(file);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (file.type.startsWith("image/")) {
        setQrFile(file);
        setDecodedLink(null);
        decodeQrFromFile(file);
        e.target.value = '';
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image file (PNG, JPG, etc.).",
        });
      }
    }
  };

  const handleAccessRecord = () => {
    if (decodedLink) {
        window.open(decodedLink, '_blank');
        router.push('/doctor/records');
    } else {
        toast({ variant: "destructive", title: "No Link Found", description: "Scan or upload a QR code to get a link." });
    }
  };


  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Connect with your patient</h1>
        <p className="text-muted-foreground">Securely access patient records using a QR code or a unique token.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
        <CardHeader>
            <CardTitle>Connect with your patient</CardTitle>
            <CardDescription>Point your camera at the patient's QR code to connect.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === null && <Camera className="h-16 w-16 text-muted-foreground" />}
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline style={{ display: hasCameraPermission ? 'block' : 'none' }} />
            {hasCameraPermission === false && <p className="text-sm text-muted-foreground p-4 text-center">Camera permission denied. Please enable it in your browser settings.</p>}
            {decodedLink && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white text-lg font-bold">QR Code Detected!</p>
                </div>
            )}
            </div>
        </CardContent>
        <CardFooter>
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>Enable permissions to use the QR scanner.</AlertDescription>
                </Alert>
            )}
            {hasCameraPermission === true && <p className="text-sm text-muted-foreground">{scanStatus}</p>}
        </CardFooter>
        </Card>

        <Card>
        <CardHeader>
            <CardTitle>Upload or Enter Token</CardTitle>
            <CardDescription>Upload a QR image or enter the token manually.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Input id="qr-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            <label htmlFor="qr-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, etc.</p>
            </div>
            </label>
            {qrFile && !decodedLink && <div className="text-sm text-center text-muted-foreground">Processing: {qrFile.name}...</div>}
            
            {decodedLink && (
              <Alert>
                <Link className="h-4 w-4" />
                <AlertTitle>Extracted Link</AlertTitle>
                <AlertDescription className="break-all">
                  <a href={decodedLink} target="_blank" rel="noopener noreferrer" className="underline">{decodedLink}</a>
                </AlertDescription>
              </Alert>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
            </div>
            <div className="space-y-2">
                <Input id="token" placeholder="Enter secure token manually..." />
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button className="w-full" onClick={handleAccessRecord} disabled={isLoading || !decodedLink}>
                {isLoading ? "Processing..." : "Access Record"}
            </Button>
        </CardFooter>
        </Card>
      </div>
    </div>
  );
}
