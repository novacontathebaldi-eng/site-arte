import React, { useState, useRef } from 'react';
import { Camera, Loader2, Trash2, Upload, Check, X } from 'lucide-react';
import { useAuthStore } from '../../store';
import { uploadImage, deleteImage, getPublicUrl, STORAGE_BUCKET } from '../../lib/supabase/storage';
import { updateDocument } from '../../lib/firebase/firestore';
import { auth } from '../../lib/firebase/config';
import { cn } from '../../lib/utils';
import { ImageCropper } from './ImageCropper';
import { SuccessCheck } from '../ui/SuccessCheck';
import { AnimatePresence, motion } from 'framer-motion';

const DEFAULT_AVATAR = `https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/${STORAGE_BUCKET}/avatars/Imagem%20Padrao%20(sem%20foto%20de%20perfil)/img_perfil.jpg`;

export const AvatarUploader: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Crop State
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPhoto = user?.photoURL || DEFAULT_AVATAR;
  const isCustomPhoto = currentPhoto !== DEFAULT_AVATAR;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Reset input value to allow selecting same file again
        e.target.value = '';
        
        // Convert to Base64 for Cropper
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setSelectedImageSrc(reader.result?.toString() || null);
            setShowCropper(true);
        });
        reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    
    // Create File from Blob
    const fileName = `avatar-${user?.uid || 'guest'}-${Date.now()}.jpg`;
    const fileToUpload = new File([croppedBlob], fileName, { type: 'image/jpeg' });
    
    await processUpload(fileToUpload);
  };

  const processUpload = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
        // 1. Delete old custom photo if exists
        if (isCustomPhoto) {
            try {
                const urlParts = currentPhoto.split(`${STORAGE_BUCKET}/`);
                if (urlParts[1]) await deleteImage(STORAGE_BUCKET, urlParts[1]);
            } catch (e) {
                console.warn("Could not delete old image", e);
            }
        }

        // 2. Upload new
        // Forçamos o path para garantir organização
        const pathName = `avatars/${file.name}`;
        const { path } = await uploadImage(STORAGE_BUCKET, file, pathName);
        
        // 3. Get URL
        const publicUrl = getPublicUrl(STORAGE_BUCKET, path);

        // 4. Update Auth & Firestore
        if (auth.currentUser) {
            await auth.currentUser.updateProfile({ photoURL: publicUrl });
            await updateDocument('users', user.uid, { photoURL: publicUrl });
            
            // Update Local Store
            setUser({ ...user, photoURL: publicUrl });
        }

        // 5. Show Success Feedback
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);

    } catch (error) {
        console.error("Upload failed", error);
        alert("Falha ao enviar imagem. Tente novamente.");
    } finally {
        setIsUploading(false);
        setSelectedImageSrc(null);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !isCustomPhoto) return;
    
    if(!confirm("Remover foto atual?")) return;

    setIsUploading(true);
    try {
        // 1. Delete from Storage
        const urlParts = currentPhoto.split(`${STORAGE_BUCKET}/`);
        if (urlParts[1]) await deleteImage(STORAGE_BUCKET, urlParts[1]);

        // 2. Reset to Default
        if (auth.currentUser) {
            await auth.currentUser.updateProfile({ photoURL: DEFAULT_AVATAR });
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
    <div className="flex flex-col items-center gap-4 relative">
        {/* Profile Image Container */}
        <div 
            className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl group cursor-pointer bg-black"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => !isUploading && fileInputRef.current?.click()}
        >
            <img 
                src={currentPhoto} 
                alt="Profile" 
                className={cn("w-full h-full object-cover transition-opacity duration-300", isHovering || isUploading ? "opacity-50" : "opacity-100")} 
            />
            
            {/* Hover Overlay for Upload */}
            {!isUploading && !showSuccess && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="text-white" size={32} />
                </div>
            )}

            {/* Loading Overlay */}
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <Loader2 className="text-accent animate-spin" size={32} />
                </div>
            )}

            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        className="absolute inset-0 bg-black/80 flex items-center justify-center z-20"
                        {...({
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 }
                        } as any)}
                    >
                        <SuccessCheck size={50} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Actions Area */}
        <div className="h-8 flex items-center justify-center">
            {isCustomPhoto && !isUploading && (
                <button 
                    onClick={handleRemovePhoto}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors opacity-60 hover:opacity-100"
                >
                    <Trash2 size={12} /> Remover Foto
                </button>
            )}
        </div>

        {/* Hidden Input */}
        <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileSelect}
        />

        {/* Cropper Modal */}
        <AnimatePresence>
            {showCropper && selectedImageSrc && (
                <ImageCropper
                    imageSrc={selectedImageSrc}
                    onCancel={() => {
                        setShowCropper(false);
                        setSelectedImageSrc(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    onCropComplete={handleCropComplete}
                />
            )}
        </AnimatePresence>
    </div>
  );
};