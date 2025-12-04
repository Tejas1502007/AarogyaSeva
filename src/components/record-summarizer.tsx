"use client";

import { useState } from "react";
import { summarizeMedicalRecords, SummarizeMedicalRecordsOutput } from "@/ai/flows/summarize-medical-records";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, Upload, AlertCircle } from "lucide-react";

export default function RecordSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummarizeMedicalRecordsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSummary(null);

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSummarize = async () => {
    if (!dataUri) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const result = await summarizeMedicalRecords({ recordDataUri: dataUri });
      setSummary(result);
    } catch (e: any) {
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Summarization Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <CardTitle>AI Record Summarizer</CardTitle>
        </div>
        <CardDescription>
          Upload a patient record (PDF, image) to generate a quick summary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="record-file">Health Record</Label>
          <div className="flex items-center gap-2">
            <Input id="record-file" type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.dcm" />
          </div>
        </div>

        <Button onClick={handleSummarize} disabled={!file || isLoading} className="w-full">
          {isLoading ? "Generating..." : "Generate Summary"}
        </Button>
        
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isLoading && (
          <div className="space-y-3 pt-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {summary && (
          <div className="pt-4 space-y-4">
            <h3 className="font-semibold text-lg">Summary</h3>
            <div className="prose prose-sm max-w-none text-foreground rounded-md border bg-accent/50 p-4">
              <p>{summary.summary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
