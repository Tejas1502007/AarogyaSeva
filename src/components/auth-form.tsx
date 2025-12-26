
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { LogIn, User, BriefcaseMedical, ArrowLeft } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const patientSignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email(),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits.").max(15, "Mobile number must be at most 15 digits.").regex(/^[0-9+\-\s()]+$/, "Please enter a valid mobile number."),
  sex: z.enum(["male", "female", "other"]),
  age: z.coerce.number().min(0, "Age must be a positive number."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const doctorSignUpSchema = z.object({
    doctorName: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email(),
    registrationNumber: z.string().min(5, "Registration number is too short."),
    yearOfRegistration: z.string().length(4, "Enter a valid 4-digit year."),
    stateMedicalCouncil: z.string().min(3, "State Medical Council is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
});


type Role = "patient" | "doctor";

interface AuthFormProps {
  initialRole?: Role;
  onBack?: () => void;
}

export function AuthForm({ initialRole, onBack }: AuthFormProps = {}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Role>(initialRole || "patient");
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const patientForm = useForm<z.infer<typeof patientSignUpSchema>>({
      resolver: zodResolver(patientSignUpSchema),
      defaultValues: { name: "", email: "", mobile: "", sex: "male", age: 0, password: "" },
  });

  const doctorForm = useForm<z.infer<typeof doctorSignUpSchema>>({
      resolver: zodResolver(doctorSignUpSchema),
      defaultValues: { doctorName: "", email: "", registrationNumber: "", yearOfRegistration: "", stateMedicalCouncil: "", password: "" },
  });


  const handleSignIn = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      if (!userCredential.user.emailVerified) {
        toast({
          variant: "destructive",
          title: "Email Not Verified",
          description: "Please verify your email before signing in. A new verification link has been sent.",
        });
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
      }
      // Successful sign-in is handled by the AuthProvider redirect
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";
       switch (error.code) {
         case 'auth/user-not-found':
         case 'auth/invalid-credential':
           errorMessage = "No account found with these credentials.";
           break;
         case 'auth/wrong-password':
           errorMessage = "Incorrect password. Please try again.";
           break;
         default:
            errorMessage = `Sign-in failed: ${error.message}`
       }
       toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (values: any, role: Role) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const name = role === 'patient' ? values.name : values.doctorName;
      await updateProfile(user, { displayName: name });

      const userDocRef = doc(db, "users", user.uid);
      let userData: any = {
        uid: user.uid,
        email: user.email,
        role: role,
        name: name,
      };

      if (role === 'patient') {
        userData = { ...userData, mobile: values.mobile, sex: values.sex, age: values.age };
      } else {
        userData = { ...userData, registrationNumber: values.registrationNumber, yearOfRegistration: values.yearOfRegistration, stateMedicalCouncil: values.stateMedicalCouncil };
      }
      
      await setDoc(userDocRef, userData);
      
      await sendEmailVerification(user);
      
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account before signing in.",
      });

      await signOut(auth);
      patientForm.reset();
      doctorForm.reset();

    } catch (error: any) {
        let errorMessage = "An unexpected error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "This email is already registered. Please sign in.";
        } else {
            errorMessage = `Sign-up failed: ${error.message}`
        }
        toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description: errorMessage,
        });
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: activeTab,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userDocRef, userData, { merge: true });
      
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-in Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = loginForm.getValues("email");
    if (!email) {
      toast({
          variant: "destructive",
          title: "Email Required",
          description: "Please enter your email to reset your password.",
      });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
          title: "Reset Link Sent",
          description: "Password reset email sent successfully!",
      });
    } catch (error: any) {
      toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send reset link.",
      });
    } finally {
      setLoading(false);
    }
  };

  const [formType, setFormType] = useState<"login" | "signup">("login");

  return (
    <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center">
            {onBack && (
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="absolute left-4 top-4 p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">AROGYA SEVA</CardTitle>
            </div>
            <CardDescription className="text-lg">
              {initialRole === 'patient' ? 'Patient Portal' : initialRole === 'doctor' ? 'Doctor Portal' : 'Your trusted partner in health record management.'}
            </CardDescription>
        </CardHeader>

        <CardContent>
            <Tabs value={formType} onValueChange={(v) => setFormType(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 pt-4">
                <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField control={loginForm.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="m@example.com" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Button variant="link" type="button" onClick={handlePasswordReset} className="p-0 h-auto text-sm" disabled={loading}>Forgot password?</Button>
                        </div>
                        <FormControl><Input type="password" {...field} disabled={loading} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={loading}><LogIn className="mr-2 h-4 w-4" />{loading ? 'Signing In...' : 'Sign In'}</Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                </form>
                </Form>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 pt-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Role)} className="w-full">
                    {!initialRole && (
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="patient"><User className="mr-2 h-4 w-4" />Patient</TabsTrigger>
                            <TabsTrigger value="doctor"><BriefcaseMedical className="mr-2 h-4 w-4" />Doctor</TabsTrigger>
                        </TabsList>
                    )}
                    <TabsContent value="patient" className="pt-4">
                        <Form {...patientForm}>
                            <form onSubmit={patientForm.handleSubmit((v) => handleSignUp(v, 'patient'))} className="space-y-4">
                                <FormField control={patientForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={patientForm.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={patientForm.control} name="mobile" render={({ field }) => ( <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <div className="grid grid-cols-2 gap-4">
                                <FormField control={patientForm.control} name="sex" render={({ field }) => ( <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                <FormField control={patientForm.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="25" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                </div>
                                <FormField control={patientForm.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                
                                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating Account...' : 'Create Patient Account'}</Button>
                            </form>
                        </Form>
                    </TabsContent>
                    <TabsContent value="doctor" className="pt-4">
                        <Form {...doctorForm}>
                            <form onSubmit={doctorForm.handleSubmit((v) => handleSignUp(v, 'doctor'))} className="space-y-4">
                                 <FormField control={doctorForm.control} name="doctorName" render={({ field }) => ( <FormItem><FormLabel>Doctor's Full Name</FormLabel><FormControl><Input placeholder="Dr. Jane Smith" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                 <FormField control={doctorForm.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="doctor@clinic.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                 <FormField control={doctorForm.control} name="registrationNumber" render={({ field }) => ( <FormItem><FormLabel>Registration Number</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                 <FormField control={doctorForm.control} name="yearOfRegistration" render={({ field }) => ( <FormItem><FormLabel>Year of Registration</FormLabel><FormControl><Input placeholder="2010" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                 <FormField control={doctorForm.control} name="stateMedicalCouncil" render={({ field }) => ( <FormItem><FormLabel>State Medical Council</FormLabel><FormControl><Input placeholder="Medical Council of India" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                 <FormField control={doctorForm.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating Account...' : 'Create Doctor Account'}</Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}