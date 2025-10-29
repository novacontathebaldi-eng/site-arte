import React, { useState, useEffect, useRef } from 'react';
import { Painting, Category } from '../types';
import * as firebaseService from '../services/firebaseService';
import { CameraModal } from './CameraModal';

interface PaintingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (painting: Painting) => Promise<void>;
    painting: Painting | null;
    categories: Category[];
}

export const PaintingModal: React.FC<PaintingModalProps> = ({ isOpen, onClose, onSave, painting, categories }) => {
    const getInitialFormData = (): Omit<Painting, 'id' | 'active' | 'orderIndex' | 'deleted'> => ({
        name: '',
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        price: 0,
        dimensions: '',
        technique: '',
        year: new Date().getFullYear(),
        imageUrl: '',
        badge: '',
        stockStatus: 'available',
        isPromotion: false,
        promotionalPrice: undefined,
    });
    
    const [formData, setFormData] = useState(getInitialFormData());
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setImageFile(null);
            if (painting) {
                setFormData({
                    ...getInitialFormData(),
                    ...painting,
                    promotionalPrice: painting.promotionalPrice || undefined,
                });
                setImagePreview(painting.imageUrl);
            } else {
                setFormData(getInitialFormData());
                setImagePreview('');
            }
        }
    }, [painting, isOpen, categories]);

    useEffect(() => {
        if (!imageFile) return;
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData({ ...formData, [name]: checked });
        } else if (type === 'number') {
            setFormData({ ...formData, [name]: value === '' ? '' : Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setFormData(prev => ({ ...prev, imageUrl: '' }));
        }
    };
    
    const handleCapture = (file: File) => {
        setImageFile(file);
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        setIsCameraOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let finalImageUrl = formData.imageUrl;
            if (imageFile) {
                finalImageUrl = await firebaseService.uploadImage(imageFile);
            }
    
            const finalPainting: Painting = {
                id: painting?.id || '',
                active: painting?.active ?? true,
                orderIndex: painting?.orderIndex ?? 0,
                deleted: painting?.deleted ?? false,
                ...formData,
                imageUrl: finalImageUrl,
                price: Number(formData.price) || 0,
                promotionalPrice: formData.isPromotion && formData.promotionalPrice ? Number(formData.promotionalPrice) : undefined,
            };
    
            await onSave(finalPainting);
            onClose();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'œuvre :", error);
            alert("Échec de l'envoi de l'image ou de la sauvegarde de l'œuvre. Veuillez réessayer.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-5 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-text-primary">{painting ? 'Modifier l\'œuvre' : 'Nouvelle Œuvre'}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" disabled={isUploading}>&times;</button>
                    </div>
                    <div className="overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Nom de l'œuvre *</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Description *</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" rows={3} required />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Catégorie *</label>
                                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-white" required>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Statut du stock</label>
                                    <select name="stockStatus" value={formData.stockStatus} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-white">
                                        <option value="available">Disponible</option>
                                        <option value="out_of_stock">Vendu</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Dimensions (ex: 80x60cm) *</label>
                                    <input name="dimensions" value={formData.dimensions} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Technique *</label>
                                    <input name="technique" value={formData.technique} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="ex: Acrylique sur toile" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Année *</label>
                                    <input name="year" type="number" value={formData.year} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-semibold mb-1">Image de l'œuvre</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border overflow-hidden">
                                        {imagePreview ? <img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover" /> : <i className="fas fa-image text-3xl text-gray-300"></i>}
                                    </div>
                                    <div className="flex-grow space-y-2">
                                        <input name="imageUrl" value={formData.imageUrl} onChange={(e) => { setFormData({...formData, imageUrl: e.target.value }); setImageFile(null); setImagePreview(e.target.value);}} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Ou collez une URL ici" />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 text-sm bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-lg hover:bg-gray-300"><i className="fas fa-upload mr-2"></i>Téléverser</button>
                                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                            <button type="button" onClick={() => setIsCameraOpen(true)} className="flex-1 text-sm bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-lg hover:bg-gray-300"><i className="fas fa-camera mr-2"></i>Caméra</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-semibold mb-1">Badge (optionnel)</label>
                                <input name="badge" value={formData.badge} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="Ex: Nouveau, Populaire" />
                            </div>
                             <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="isPromotion"
                                        checked={formData.isPromotion} 
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded border-gray-400 text-brand-secondary focus:ring-brand-secondary"
                                    />
                                    <span className="font-semibold text-yellow-800">Marquer comme promotion</span>
                                </label>

                                {formData.isPromotion && (
                                    <div className="pl-8 animate-fade-in-up grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Prix Standard (€) *</label>
                                            <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="0.00" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Prix Promotionnel (€) *</label>
                                            <input name="promotionalPrice" type="number" step="0.01" value={formData.promotionalPrice || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="0.00" required />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {!formData.isPromotion && (
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Prix (€) *</label>
                                    <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="0.00" required />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={onClose} disabled={isUploading} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50">Annuler</button>
                                <button type="submit" disabled={isUploading} className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 flex items-center justify-center min-w-[150px] disabled:opacity-70">
                                    {isUploading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save mr-2"></i><span>Sauvegarder</span></>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {isCameraOpen && <CameraModal onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
        </>
    );
};
