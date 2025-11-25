
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import getCroppedImg from '../../lib/canvasUtils';
import { cn } from '../../lib/utils';
import { Spinner } from '../ui/Spinner';

interface ImageCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCancel, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        {...({
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.9, opacity: 0 }
        } as any)}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a]">
            <h3 className="text-white font-serif text-lg">Ajustar Foto de Perfil</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Cropper Area */}
        <div className="relative w-full h-[50vh] min-h-[300px] md:h-[400px] bg-[#0a0a0a]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={true}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
            objectFit="auto-cover"
            restrictPosition={false}
            minZoom={0.5}
            classes={{
                containerClassName: "bg-[#0a0a0a]",
                cropAreaClassName: "border-2 border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]"
            }}
          />
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none flex items-center gap-2 border border-white/10">
            <Move size={12} /> Arraste para ajustar
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-[#121212] space-y-6">
            <div className="flex items-center gap-4">
                <ZoomOut size={16} className="text-gray-500" />
                <input
                    type="range"
                    value={zoom}
                    min={0.5}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent hover:accent-[#b59328]"
                />
                <ZoomIn size={16} className="text-gray-500" />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 py-3 text-gray-400 hover:text-white border border-white/10 rounded-full font-bold uppercase text-xs tracking-widest transition-colors hover:bg-white/5"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-accent text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#b59328] transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                >
                    {isProcessing ? <Spinner className="w-4 h-4 text-white" /> : <Check size={16} />}
                    Confirmar Corte
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
