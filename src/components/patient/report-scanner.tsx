
"use client";

import { useState } from "react";
import { scanReport, ScanReportOutput } from "@/ai/flows/scan-report";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, AlertCircle, Pill, Stethoscope, ClipboardList, CheckCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";


export default function ReportScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ScanReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setAnalysis(null);

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleScanReport = async () => {
    if (!dataUri) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await scanReport({ reportDataUri: dataUri });
      setAnalysis(result);
      await saveAnalysisToFirestore(result);
    } catch (e: any) {
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysisToFirestore = async (analysisData: ScanReportOutput) => {
    if (!user || !file || !analysisData) return;

    setIsSaving(true);
    try {
        await addDoc(collection(db, "records"), {
            ownerId: user.uid,
            name: file.name,
            type: "Scanned Report",
            createdAt: serverTimestamp(),
            analysis: analysisData,
        });
        toast({
            title: "Analysis Saved!",
            description: "Your report has been saved to your records vault.",
        });
    } catch (e: any) {
        console.error("Error saving to Firestore: ", e);
        setError("Failed to save the analysis to your records.");
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the analysis. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
        <header className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">AI Report Scanner</h1>
            <p className="text-muted-foreground">Upload a medical document to get an AI-powered analysis.</p>
        </header>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle>Upload Document</CardTitle>
            </div>
            <CardDescription>
              Your report will be analyzed and automatically saved to your records vault.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <Input id="record-file" type="file" onChange={handleFileChange} className="flex-1" accept=".pdf,.png,.jpg,.jpeg" />
                <Button onClick={handleScanReport} disabled={!file || isLoading || isSaving} className="w-48">
                    {isLoading ? "Analyzing..." : "Analyze Report"}
                </Button>
            </div>
            
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading && (
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
              </div>
            )}

            {analysis && (
              <div className="pt-4 space-y-6">
                <Alert className="bg-green-50 border-green-200 text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Analysis Complete & Saved!</AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                       <span>The results have been stored in your vault.</span>
                       <Button variant="outline" size="sm" onClick={() => router.push('/patient/records')}>
                           View My Records
                       </Button>
                    </AlertDescription>
                </Alert>
                
                <div className="prose prose-sm max-w-none text-foreground rounded-md border bg-accent/50 p-4">
                    <h4 className="font-semibold text-lg">Summary</h4>
                    <p>{analysis.summary}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Stethoscope className="h-5 w-5" /> Diagnosis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{analysis.diagnosis || "Not specified."}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" /> Follow-up
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{analysis.followUp || "No follow-up mentioned."}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                           <Pill className="h-5 w-5" /> Prescribed Medications
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        {analysis.medications && analysis.medications.length > 0 ? (
                            <div className="space-y-3">
                                {analysis.medications.map((med, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                        <div className="font-semibold">{med.name}</div>
                                        <div className="text-sm">
                                            <Badge variant="secondary" className="mr-2">{med.dosage}</Badge>
                                            <Badge variant="outline">{med.frequency}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No medications listed in the report.</p>
                        )}
                    </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
