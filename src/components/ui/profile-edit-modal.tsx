"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, Loader2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "patient" | "doctor";
  currentProfile: any;
  onSave: (profile: any) => void;
}

export function ProfileEditModal({ isOpen, onClose, userType, currentProfile, onSave }: ProfileEditModalProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(currentProfile);
  const [imagePreview, setImagePreview] = useState(currentProfile?.image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 400;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.7);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedFile = await compressImage(file);
      setImageFile(compressedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(compressedFile);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      let imageUrl = profile?.image || "";
      
      // Upload image if a new file was selected
      if (imageFile) {
        const imageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}-${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      // Update profile data
      const updatedProfile = {
        ...profile,
        image: imageUrl,
        updatedAt: new Date().toISOString()
      };
      
      // Save to Firebase
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, updatedProfile);
      
      // Update local state
      onSave(updatedProfile);
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const colorScheme = userType === "patient" 
    ? { primary: "#00796B", secondary: "#26A69A", bg: "bg-teal-50" }
    : { primary: "#0284C7", secondary: "#06B6D4", bg: "bg-sky-50" };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${colorScheme.bg}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: colorScheme.primary }}>
            Edit {userType === "patient" ? "Patient" : "Doctor"} Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4" style={{ borderColor: colorScheme.secondary }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colorScheme.secondary }}>
                    <Camera className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <label 
                className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer shadow-lg focus-visible:focus" 
                style={{ backgroundColor: colorScheme.primary }}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.querySelector('input')?.click()}
              >
                <Upload className="h-4 w-4 text-white" aria-hidden="true" />
                <span className="sr-only">Upload profile image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  aria-label="Upload profile image"
                />
              </label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input 
                value={profile?.name || ""} 
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="border-2" 
                style={{ borderColor: colorScheme.secondary }}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input 
                value={profile?.phone || ""} 
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="border-2" 
                style={{ borderColor: colorScheme.secondary }}
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input 
              value={profile?.email || ""} 
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="border-2" 
              style={{ borderColor: colorScheme.secondary }}
            />
          </div>

          {userType === "doctor" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Specialization</Label>
                  <Input 
                    value={profile?.specialization || ""} 
                    onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                    className="border-2" 
                    style={{ borderColor: colorScheme.secondary }}
                  />
                </div>
                <div>
                  <Label>Experience (Years)</Label>
                  <Input 
                    type="number"
                    value={profile?.experience || ""} 
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    className="border-2" 
                    style={{ borderColor: colorScheme.secondary }}
                  />
                </div>
              </div>
              <div>
                <Label>Qualifications</Label>
                <Input 
                  value={profile?.qualifications || ""} 
                  onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
                  placeholder="e.g., MBBS, MD - Cardiology"
                  className="border-2" 
                  style={{ borderColor: colorScheme.secondary }}
                />
              </div>
            </>
          )}

          {userType === "patient" && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input 
                    type="number"
                    value={profile?.age || ""} 
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="border-2" 
                    style={{ borderColor: colorScheme.secondary }}
                  />
                </div>
                <div>
                  <Label>Blood Group</Label>
                  <Input 
                    value={profile?.bloodGroup || ""} 
                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                    placeholder="e.g., O+"
                    className="border-2" 
                    style={{ borderColor: colorScheme.secondary }}
                  />
                </div>
                <div>
                  <Label>Emergency Contact</Label>
                  <Input 
                    value={profile?.emergencyContact || ""} 
                    onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                    className="border-2" 
                    style={{ borderColor: colorScheme.secondary }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label>Address</Label>
            <Textarea 
              value={profile?.address || ""} 
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="border-2" 
              style={{ borderColor: colorScheme.secondary }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1 border-2" 
              style={{ borderColor: colorScheme.secondary }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 text-white font-semibold" 
              style={{ backgroundColor: colorScheme.primary }}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}