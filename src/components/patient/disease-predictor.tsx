
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { predictDisease, DiseasePredictorOutput } from "@/ai/flows/disease-predictor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Lightbulb, AlertTriangle, Activity, ShieldAlert, Sparkles, MapPin, CheckCircle, Mic, Volume2 } from "lucide-react";
import { VoiceInput, TextToSpeech } from "@/components/ui/voice-input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";


const formSchema = z.object({
    symptoms: z.string().min(10, "Please describe your symptoms in more detail."),
    painLocation: z.string().min(3, { message: "Please describe the location of your pain." }),
    duration: z.string().min(2, "Please enter a valid duration (e.g., '3 days')."),
});

const bodyParts = [
    { id: 'Head', name: 'Head', style: { top: '3%', left: '38%', width: '24%', height: '15%', borderRadius: '50%' } },
    { id: 'Chest', name: 'Chest', style: { top: '18%', left: '33%', width: '34%', height: '15%', borderRadius: '20%' } },
    { id: 'Abdomen', name: 'Abdomen', style: { top: '33%', left: '34%', width: '32%', height: '18%', borderRadius: '15%' } },
    { id: 'Left_Arm', name: 'Left Arm', style: { top: '20%', left: '15%', width: '18%', height: '40%', borderRadius: '10px' } },
    { id: 'Right_Arm', name: 'Right Arm', style: { top: '20%', right: '15%', width: '18%', height: '40%', borderRadius: '10px' } },
    { id: 'Left_Leg', name: 'Left Leg', style: { top: '51%', left: '30%', width: '18%', height: '45%', borderRadius: '10px' } },
    { id: 'Right_Leg', name: 'Right Leg', style: { top: '51%', right: '30%', width: '18%', height: '45%', borderRadius: '10px' } },
];

export default function DiseasePredictor() {
    const [prediction, setPrediction] = useState<DiseasePredictorOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();
    const router = useRouter();
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedPainAreas, setSelectedPainAreas] = useState<string[]>([]);
    const [selectedDuration, setSelectedDuration] = useState<string>('');

    const symptomOptions = ["Fever", "Cough", "Headache", "Fatigue", "Nausea", "Cold", "Body Pain", "Sore Throat", "Breathing Difficulty"];
    const painAreaOptions = ["Head", "Chest", "Stomach", "Back", "Throat", "Legs", "Arms", "Joints", "Whole Body"];
    const durationOptions = ["1-2 Days", "3-5 Days", "About a Week", "More than a Week"];


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          symptoms: "",
          painLocation: "",
          duration: "",
        },
    });

    const toggleSymptom = (symptom: string) => {
        const newSymptoms = selectedSymptoms.includes(symptom)
            ? selectedSymptoms.filter(s => s !== symptom)
            : [...selectedSymptoms, symptom];
        setSelectedSymptoms(newSymptoms);
        const currentText = form.getValues('symptoms');
        const symptomsText = newSymptoms.join(', ');
        form.setValue('symptoms', symptomsText + (currentText && !newSymptoms.some(s => currentText.includes(s)) ? `, ${currentText}` : ''));
    };

    const togglePainArea = (area: string) => {
        const newAreas = selectedPainAreas.includes(area)
            ? selectedPainAreas.filter(a => a !== area)
            : [...selectedPainAreas, area];
        setSelectedPainAreas(newAreas);
        form.setValue('painLocation', newAreas.join(', '));
    };

    const selectDuration = (duration: string) => {
        setSelectedDuration(duration);
        form.setValue('duration', duration);
    };
    
    const savePrediction = async (predictionData: DiseasePredictorOutput, inputs: z.infer<typeof formSchema>) => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to save a prediction.",
            });
            return;
        }
        setIsSaving(true);
        try {
            await addDoc(collection(db, "records"), {
                ownerId: user.uid,
                name: `AI Prediction - ${format(new Date(), 'PPP')}`,
                type: predictionData.recordType || 'ai-disease-prediction',
                createdAt: serverTimestamp(),
                analysis: { // Save the entire analysis payload
                    inputs,
                    prediction: predictionData,
                },
            });
            toast({
                title: "Prediction Saved!",
                description: "Your AI analysis has been saved to your records vault.",
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
    }


    const handlePredict = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const result = await predictDisease(values);
            setPrediction(result);
            await savePrediction(result, values);
        } catch (e: any) {
            const errorMessage = e.message || "An unexpected error occurred.";
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "Prediction Failed",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getProbabilityBadge = (probability: string) => {
        switch (probability.toLowerCase()) {
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            default: return 'outline';
        }
    }

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">AI Disease Predictor</h1>
                <p className="text-muted-foreground">Answer a few questions to get an AI-powered analysis of potential conditions.</p>
            </header>

            <div className="grid gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" />
                            <CardTitle>Symptom Analysis</CardTitle>
                        </div>
                        <CardDescription>Please provide as much detail as possible for a more accurate prediction.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handlePredict)} className="space-y-6">
                                <FormField control={form.control} name="symptoms" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            What symptoms are you experiencing?
                                            <Mic className="h-4 w-4 text-[#009688]" />
                                        </FormLabel>
                                        <div className="space-y-4">
                                            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#26A69A]/20">
                                                <p className="text-sm font-medium text-[#263238] mb-3">Quick Select:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {symptomOptions.map((symptom) => (
                                                        <button
                                                            key={symptom}
                                                            type="button"
                                                            onClick={() => toggleSymptom(symptom)}
                                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                                selectedSymptoms.includes(symptom)
                                                                    ? 'bg-[#009688] text-white shadow-md'
                                                                    : 'bg-white text-[#263238] border border-[#26A69A]/30 hover:bg-[#26A69A]/10'
                                                            }`}
                                                        >
                                                            {symptom}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Textarea 
                                                        placeholder="Add more details or use voice input..." 
                                                        {...field} 
                                                        className="pr-20 border-[#26A69A]/30 focus:border-[#009688]"
                                                    />
                                                    <div className="absolute right-2 top-2 flex gap-1">
                                                        <VoiceInput 
                                                            onTranscript={(text) => field.onChange(field.value + (field.value ? ' ' : '') + text)}
                                                        />
                                                        <TextToSpeech text={field.value} />
                                                    </div>
                                                </div>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="painLocation" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            Which part of your body is in pain?
                                            <Mic className="h-4 w-4 text-[#009688]" />
                                        </FormLabel>
                                        <div className="space-y-4">
                                            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#26A69A]/20">
                                                <p className="text-sm font-medium text-[#263238] mb-3">Select Body Parts:</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {painAreaOptions.map((area) => (
                                                        <button
                                                            key={area}
                                                            type="button"
                                                            onClick={() => togglePainArea(area)}
                                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                                selectedPainAreas.includes(area)
                                                                    ? 'bg-[#009688] text-white shadow-md'
                                                                    : 'bg-white text-[#263238] border border-[#26A69A]/30 hover:bg-[#26A69A]/10'
                                                            }`}
                                                        >
                                                            {area}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input 
                                                        placeholder="Add specific details..." 
                                                        {...field} 
                                                        className="pr-20 border-[#26A69A]/30 focus:border-[#009688]"
                                                    />
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                        <VoiceInput 
                                                            onTranscript={(text) => field.onChange(text)}
                                                        />
                                                        <TextToSpeech text={field.value} />
                                                    </div>
                                                </div>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="duration" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>For how many days have you had these symptoms?</FormLabel>
                                        <div className="space-y-4">
                                            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#26A69A]/20">
                                                <p className="text-sm font-medium text-[#263238] mb-3">Duration Options:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {durationOptions.map((duration) => (
                                                        <button
                                                            key={duration}
                                                            type="button"
                                                            onClick={() => selectDuration(duration)}
                                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                                selectedDuration === duration
                                                                    ? 'bg-[#009688] text-white shadow-md'
                                                                    : 'bg-white text-[#263238] border border-[#26A69A]/30 hover:bg-[#26A69A]/10'
                                                            }`}
                                                        >
                                                            {duration}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Or specify exact duration..." 
                                                    {...field} 
                                                    className="border-[#26A69A]/30 focus:border-[#009688]"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                <Button type="submit" className="w-full bg-[#009688] hover:bg-[#00796B]" disabled={isLoading || isSaving}>
                                    {isLoading ? <><Activity className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : isSaving ? 'Saving...' : <><Sparkles className="mr-2 h-4 w-4" />Predict & Save</>}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="space-y-6 lg:col-span-2">
                    <Card>
                         <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-6 w-6 text-primary" />
                                    <CardTitle>Analysis Results</CardTitle>
                                </div>
                                {prediction && (
                                    <TextToSpeech 
                                        text={`Analysis complete. ${prediction.predictedDiseases.length} potential conditions found: ${prediction.predictedDiseases.map(d => `${d.name} with ${d.probability} likelihood`).join(', ')}`}
                                    />
                                )}
                            </div>
                            <CardDescription>Potential conditions based on your symptoms.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading && (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="p-4 border rounded-lg space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Skeleton className="h-5 w-1/3" />
                                                <Skeleton className="h-6 w-1/4" />
                                            </div>
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-5/6" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {prediction && (
                                <div className="space-y-4">
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
                                    {prediction.predictedDiseases.length > 0 ? (
                                        prediction.predictedDiseases.map((disease, index) => (
                                            <div key={index} className="p-4 border rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-semibold text-lg">{disease.name}</h4>
                                                    <Badge variant={getProbabilityBadge(disease.probability)}>{disease.probability} Likelihood</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{disease.description}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-4">No specific conditions could be predicted from the symptoms provided.</p>
                                    )}
                                </div>
                            )}
                             
                            {!isLoading && !error && !prediction && (
                                <div className="text-center text-muted-foreground py-8">
                                    <p>Your prediction results will appear here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {prediction && (
                        <>
                            <Alert variant="destructive">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle>Important Disclaimer</AlertTitle>
                                <AlertDescription>{prediction.disclaimer}</AlertDescription>
                            </Alert>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
