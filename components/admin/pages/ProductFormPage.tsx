import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { supabase } from '../../../lib/supabase';
import { ProductDocument, LanguageCode } from '../../../firebase-types';
import { useRouter } from '../../../hooks/useRouter';
import { useToast } from '../../../hooks/useToast';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';

type ProductFormData = Omit<ProductDocument, 'id' | 'createdAt' | 'updatedAt'>;

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
    publishedAt: null,
};

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
    const [activeLang, setActiveLang] = useState<LanguageCode>(LanguageCode.EN);
    const [uploading, setUploading] = useState(false);

    const { navigate } = useRouter();
    const { addToast } = useToast();
    const { t } = useI18n();

    const fetchProduct = useCallback(async (productId: string) => {
        setLoading(true);
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as Partial<ProductFormData>;
            const productData = {
                ...emptyProduct,
                ...data,
                price: { ...emptyProduct.price, ...(data.price || {}) },
                dimensions: data.dimensions ? { ...(emptyProduct.dimensions || { height: 0, width: 0, depth: 0 }), ...data.dimensions } : emptyProduct.dimensions,
                translations: { ...emptyProduct.translations, ...(data.translations || {}) },
            };
            setProduct(productData);
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
        
        const keys = name.split('.');
        setProduct(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if(current[keys[i]] === undefined) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        if (name === 'published') {
            setProduct(prev => ({ ...prev, publishedAt: checked ? serverTimestamp() as any : null }));
        } else {
             setProduct(prev => ({ ...prev, [name]: checked }));
        }
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
            addToast(t('admin.productForm.uploadSuccess'), "success");
        } catch (error) {
            // FIX: The 'error' object in a catch block is of type 'unknown'. A type check is required to safely access its properties.
            const errorMessage = error instanceof Error ? error.message : String(error);
            addToast(`${t('admin.productForm.uploadError')}: ${errorMessage}`, "error");
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
                addToast(t('admin.productForm.updateSuccess'), "success");
            } else {
                const newDocRef = await addDoc(collection(db, "products"), {
                    ...dataToSave,
                    createdAt: serverTimestamp(),
                });
                addToast(t('admin.productForm.createSuccess'), "success");
                navigate(`/admin/products/edit/${newDocRef.id}`);
            }
        } catch (error) {
            // FIX: The 'error' object in a catch block is of type 'unknown'. A type check is required to safely access its properties.
            const errorMessage = error instanceof Error ? error.message : String(error);
            addToast(`${t('admin.productForm.saveError')}: ${errorMessage}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Main Details */}
                <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold font-serif mb-4">Product Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="sku" name="sku" label={t('admin.productForm.sku')} value={product.sku} onChange={handleChange} />
                        <div>
                        <label className="block text-sm font-medium text-brand-black/80 dark:text-brand-white/80 mb-1">{t('admin.productForm.category')}</label>
                        <select name="category" value={product.category} onChange={handleChange} className="w-full px-3 py-2 border border-brand-black/20 dark:border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-shadow bg-transparent dark:bg-gray-800">
                            <option value="paintings">Paintings</option>
                            <option value="jewelry">Jewelry</option>
                            <option value="digital">Digital</option>
                            <option value="prints">Prints</option>
                        </select>
                        </div>
                    </div>
                    <div className="mt-6 border-t dark:border-white/10 pt-6">
                         <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="font-medium">{t('admin.productForm.certificate')}</p>
                                <p className="text-sm text-brand-black/60 dark:text-brand-white/60">{t('admin.productForm.certificateHelp')}</p>
                            </div>
                            <div className="relative inline-flex items-center">
                                <input type="checkbox" name="certificateOfAuthenticity" checked={product.certificateOfAuthenticity} onChange={handleCheckboxChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                            </div>
                        </label>
                    </div>
                </div>


                {/* Translations */}
                <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold font-serif mb-2">{t('admin.productForm.translations')}</h3>
                    <div className="border-b border-black/10 dark:border-white/10 mb-4">
                        <nav className="-mb-px flex space-x-6">
                            {languages.map(lang => (
                                <button key={lang.code} type="button" onClick={() => setActiveLang(lang.code)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeLang === lang.code ? 'border-brand-gold text-brand-black dark:text-brand-white' : 'border-transparent text-brand-black/50 dark:text-brand-white/50 hover:text-brand-black dark:hover:text-brand-white'}`}>
                                    {lang.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div>
                        <Input id={`title-${activeLang}`} name="title" label={t('admin.productForm.title')} value={product.translations?.[activeLang]?.title || ''} onChange={handleTranslationChange} />
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-brand-black/80 dark:text-brand-white/80 mb-1">{t('admin.productForm.description')}</label>
                            <textarea name="description" value={product.translations?.[activeLang]?.description || ''} onChange={handleTranslationChange} rows={8} className="w-full px-3 py-2 border border-brand-black/20 dark:border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-shadow bg-transparent dark:bg-gray-800"></textarea>
                        </div>
                    </div>
                </div>
                
                {/* Images */}
                <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold font-serif mb-4">{t('admin.productForm.images')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {product.images.map((img, index) => (
                            <div key={index} className="relative group">
                                <img src={img.url} className="w-full h-32 object-cover rounded-md"/>
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                            </div>
                        ))}
                        <label className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            {uploading ? <Spinner/> : <span>+ {t('admin.productForm.addImage')}</span>}
                            <input type="file" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-1 space-y-8">
                 <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold font-serif mb-4">Organization</h3>
                     <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="font-medium">{t('admin.productForm.publish')}</p>
                            <p className="text-sm text-brand-black/60 dark:text-brand-white/60">{t('admin.productForm.publishHelp')}</p>
                        </div>
                        <div className="relative inline-flex items-center">
                            <input type="checkbox" name="published" checked={!!product.publishedAt} onChange={handleCheckboxChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                        </div>
                    </label>
                    <div className="mt-6 border-t dark:border-white/10 pt-6">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="font-medium">{t('admin.productForm.featured')}</p>
                                <p className="text-sm text-brand-black/60 dark:text-brand-white/60">{t('admin.productForm.featuredHelp')}</p>
                            </div>
                            <div className="relative inline-flex items-center">
                                <input type="checkbox" name="featured" checked={product.featured} onChange={handleCheckboxChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold font-serif mb-4">Pricing & Inventory</h3>
                    <Input id="price" name="price.amount" label={t('admin.productForm.price')} type="number" value={product.price?.amount || 0} onChange={handleChange} />
                    <Input id="stock" name="stock" label={t('admin.productForm.stock')} type="number" value={product.stock} onChange={handleChange} className="mt-4" />
                </div>
                
                 <div className="sticky top-24">
                     <div className="flex items-center gap-2">
                        <Button type="button" variant="tertiary" className="w-full" onClick={() => navigate('/admin/products')}>{t('admin.productForm.cancel')}</Button>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? t('admin.productForm.saving') : t('admin.productForm.save')}</Button>
                    </div>
                 </div>
            </div>
        </form>
    );
};

export default ProductFormPage;