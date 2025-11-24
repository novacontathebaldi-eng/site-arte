import React, { useState, useRef } from 'react';
import { Camera, Loader2, Trash2, Upload, Check, X } from 'lucide-react';
import { useAuthStore } from '../../store';
import { uploadImage, deleteImage, getPublicUrl } from '../../lib/supabase/storage';
import { updateDocument } from '../../lib/firebase/firestore';
import { auth } from '../../lib/firebase/config';
import { updateProfile } from 'firebase/auth';
import { cn } from '../../lib/utils';

const DEFAULT_AVATAR = "https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-arte/img_perfil.jpg";
const BUCKET = "storage-arte";

export const AvatarUploader: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPhoto = user?.photoURL || DEFAULT_AVATAR;
  const isCustomPhoto = currentPhoto !== DEFAULT_AVATAR;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    }
  };

  const confirmUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
        // 1. Delete old custom photo if exists
        if (isCustomPhoto) {
            try {
                const oldPath = currentPhoto.split(`${BUCKET}/`)[1];
                if (oldPath) await deleteImage(BUCKET, oldPath);
            } catch (e) {
                console.warn("Could not delete old image", e);
            }
        }

        // 2. Upload new
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `avatar-${user.uid}-${Date.now()}.${fileExt}`;
        const { path } = await uploadImage(BUCKET, selectedFile, `avatars/${fileName}`);
        
        // 3. Get URL
        const publicUrl = getPublicUrl(BUCKET, path);

        // 4. Update Auth & Firestore
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: publicUrl });
            await updateDocument('users', user.uid, { photoURL: publicUrl });
            
            // Update Local Store
            setUser({ ...user, photoURL: publicUrl });
        }

        setPreview(null);
        setSelectedFile(null);

    } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload image");
    } finally {
        setIsUploading(false);
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  const handleRemovePhoto = async () => {
    if (!user || !isCustomPhoto) return;
    
    if(!confirm("Remover foto atual?")) return;

    setIsUploading(true);
    try {
        // 1. Delete from Storage
        const oldPath = currentPhoto.split(`${BUCKET}/`)[1];
        if (oldPath) await deleteImage(BUCKET, oldPath);

        // 2. Reset to Default
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: DEFAULT_AVATAR });
            await updateDocument('users', user.uid, { photoURL: DEFAULT_AVATAR });
            setUser({ ...user, photoURL: DEFAULT_AVATAR });
        }
    } catch (error) {
        console.error("Delete failed", error);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
        <div 
            className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl group cursor-pointer bg-black"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => !preview && fileInputRef.current?.click()}
        >
            <img 
                src={preview || currentPhoto} 
                alt="Profile" 
                className={cn("w-full h-full object-cover transition-opacity", isHovering && !preview ? "opacity-50" : "opacity-100")} 
            />
            
            {/* Hover Overlay for Upload */}
            {!preview && !isUploading && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={32} />
                </div>
            )}

            {/* Loading Overlay */}
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Loader2 className="text-accent animate-spin" size={32} />
                </div>
            )}
        </div>

        {/* Actions Area */}
        <div className="h-8">
            {preview ? (
                <div className="flex gap-3 animate-fade-in">
                    <button 
                        onClick={confirmUpload}
                        disabled={isUploading}
                        className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                        title="Confirm Upload"
                    >
                        <Check size={16} />
                    </button>
                    <button 
                        onClick={cancelPreview}
                        disabled={isUploading}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        title="Cancel"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <>
                    {isCustomPhoto && (
                        <button 
                            onClick={handleRemovePhoto}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                        >
                            <Trash2 size={12} /> Remover Foto
                        </button>
                    )}
                </>
            )}
        </div>

        <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileSelect}
        />
    </div>
  );
};