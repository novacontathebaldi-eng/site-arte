import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { supabase } from '../../../lib/supabase';
import { ProductDocument, LanguageCode } from '../../../firebase-types';
import { useRouter } from '../../../hooks/useRouter';
import { useToast } from '../../../hooks/useToast';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Spinner from '../../common/Spinner';

type ProductFormData = Omit<ProductDocument, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>;

const emptyProduct: ProductFormData = {
    sku: '',
    category: 'paintings',
    translations: {},
    images: [],
    price: { amount: 0, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 0, width: 0, depth: 0 },
    weight: 0,
    yearCreated: new Date().getFullYear(),
    status: 'available',
    stock: 1,
    certificateOfAuthenticity: false,
    tags: [],
    featured: false,
    views: 0,
};

// FIX: Used LanguageCode enum members instead of string literals to match the type.
const languages: { code: LanguageCode, name: string }[] = [
    { code: LanguageCode.EN, name: 'English' },
    { code: LanguageCode.FR, name: 'Français' },
    { code: LanguageCode.DE, name: 'Deutsch' },
    { code: LanguageCode.PT, name: 'Português' },
];

const ProductFormPage: React.FC<{ id?: string }> = ({ id }) => {
    const [product, setProduct] = useState<ProductFormData>(emptyProduct);
    const [loading, setLoading] = useState(!!id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // FIX: Used LanguageCode enum for the initial state to fix type error.
    const [activeLang, setActiveLang] = useState<LanguageCode>(LanguageCode.EN);
    const [uploading, setUploading] = useState(false);

    const { navigate } = useRouter();
    const { addToast } = useToast();

    const fetchProduct = useCallback(async (productId: string) => {
        setLoading(true);
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setProduct(docSnap.data() as ProductFormData);
        } else {
            addToast("Product not found", "error");
            navigate('/admin/products');
        }
        setLoading(false);
    }, [addToast, navigate]);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id, fetchProduct]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        const keys = name.split('.');
        setProduct(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
            return newState;
        });
    };

    const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                [activeLang]: {
                    ...prev.translations?.[activeLang],
                    [name]: value
                }
            }
        }));
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        try {
            for (const file of Array.from(e.target.files)) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `products/${id || 'new'}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);
                
                setProduct(prev => ({
                    ...prev,
                    images: [...prev.images, { url: publicUrl, thumbnailUrl: publicUrl, alt: '', order: prev.images.length }]
                }));
            }
            addToast("Images uploaded successfully", "success");
        } catch (error: any) {
            addToast(`Image upload failed: ${error.message}`, "error");
        } finally {
            setUploading(false);
        }
    };
    
    const removeImage = (index: number) => {
        setProduct(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const dataToSave = {
                ...product,
                price: {
                    ...product.price,
                    amount: Number(product.price.amount)
                },
                updatedAt: serverTimestamp(),
            };

            if (id) {
                await setDoc(doc(db, "products", id), dataToSave, { merge: true });
                addToast("Product updated successfully", "success");
            } else {
                const newDocRef = await addDoc(collection(db, "products"), {
                    ...dataToSave,
                    createdAt: serverTimestamp(),
                    publishedAt: null,
                });
                addToast("Product created successfully", "success");
                navigate(`/admin/products/edit/${newDocRef.id}`);
            }
        } catch (error: any) {
            addToast(`Error saving product: ${error.message}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-serif">{id ? 'Edit Product' : 'Create New Product'}</h2>
                <div className="flex gap-2">
                    <Button type="button" variant="tertiary" onClick={() => navigate('/admin/products')}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Product'}</Button>
                </div>
            </div>

            {/* Main Details */}
            <div className="bg-brand-white p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="sku" name="sku" label="SKU" value={product.sku} onChange={handleChange} />
                <div>
                  <label className="block text-sm font-medium text-brand-black/80 mb-1">Category</label>
                  <select name="category" value={product.category} onChange={handleChange} className="w-full px-3 py-2 border border-brand-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-shadow">
                      <option value="paintings">Paintings</option>
                      <option value="jewelry">Jewelry</option>
                      <option value="digital">Digital</option>
                      <option value="prints">Prints</option>
                  </select>
                </div>
                <Input id="price" name="price.amount" label="Price (in cents)" type="number" value={product.price.amount} onChange={handleChange} />
                <Input id="stock" name="stock" label="Stock" type="number" value={product.stock} onChange={handleChange} />
            </div>

            {/* Translations */}
            <div className="bg-brand-white p-6 rounded-lg shadow">
                <div className="border-b border-black/10 mb-4">
                    <nav className="-mb-px flex space-x-6">
                        {languages.map(lang => (
                            <button key={lang.code} type="button" onClick={() => setActiveLang(lang.code)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeLang === lang.code ? 'border-brand-gold text-brand-black' : 'border-transparent text-brand-black/50 hover:text-brand-black'}`}>
                                {lang.name}
                            </button>
                        ))}
                    </nav>
                </div>
                <div>
                    <Input id={`title-${activeLang}`} name="title" label="Title" value={product.translations?.[activeLang]?.title || ''} onChange={handleTranslationChange} />
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-brand-black/80 mb-1">Description</label>
                        <textarea name="description" value={product.translations?.[activeLang]?.description || ''} onChange={handleTranslationChange} rows={5} className="w-full px-3 py-2 border border-brand-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-shadow"></textarea>
                    </div>
                </div>
            </div>
            
            {/* Images */}
            <div className="bg-brand-white p-6 rounded-lg shadow">
                 <h3 className="font-bold font-serif mb-4">Images</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     {product.images.map((img, index) => (
                         <div key={index} className="relative group">
                             <img src={img.url} className="w-full h-32 object-cover rounded-md"/>
                             <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100">&times;</button>
                         </div>
                     ))}
                     <label className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-black/5">
                         {uploading ? <Spinner/> : <span>+ Add Image</span>}
                         <input type="file" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                     </label>
                 </div>
            </div>
        </form>
    );
};

export default ProductFormPage;