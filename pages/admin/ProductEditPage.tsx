import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../hooks/useToast';
import { Product, Language } from '../../types';
import { getProductById, upsertProduct, uploadProductImages } from '../../services/api';
import { LANGUAGES, ROUTES } from '../../constants';
import { UploadIcon, ImageIcon, XIcon, TrashIcon } from '../../components/ui/icons';
import Button from '../../components/ui/Button';

const ProductEditPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showToast } = useToast();

    const [product, setProduct] = useState<Partial<Product>>({
        translations: {
            fr: { title: '', description: '', materials: '' },
            en: { title: '', description: '', materials: '' },
            de: { title: '', description: '', materials: '' },
            pt: { title: '', description: '', materials: '' },
        },
        images: [],
        price: { amount: 0, currency: 'EUR' },
        status: 'available',
        stock: 1,
    });
    const [newImages, setNewImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState<Language>('fr');

    useEffect(() => {
        if (productId) {
            const fetchProduct = async () => {
                setIsLoading(true);
                try {
                    const fetchedProduct = await getProductById(productId);
                    if (fetchedProduct) {
                        setProduct(fetchedProduct);
                    } else {
                        showToast('Product not found', 'error');
                        navigate(ROUTES.ADMIN_PRODUCTS);
                    }
                } catch (error) {
                    showToast(t('toast.error'), 'error');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProduct();
        }
    }, [productId, navigate, t, showToast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [field, subfield] = name.split('.');
            setProduct(prev => ({ ...prev, [field]: { ...(prev as any)[field], [subfield]: value } }));
        } else {
            setProduct(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                [activeLangTab]: {
                    ...prev.translations?.[activeLangTab],
                    [name]: value,
                }
            }
        }));
    };

    const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setNewImages(prev => [...prev, ...files.filter(f => f.type.startsWith('image/'))]);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setNewImages(prev => [...prev, ...files.filter(f => f.type.startsWith('image/'))]);
    };
    
    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let uploadedImageUrls: { url: string; alt: string; order: number }[] = product.images || [];

            if (newImages.length > 0) {
                const newUploadedImages = await uploadProductImages(newImages, productId || `new-${Date.now()}`);
                uploadedImageUrls = [...uploadedImageUrls, ...newUploadedImages];
            }
            
            // Re-order images
            uploadedImageUrls.forEach((img, index) => img.order = index + 1);

            const productToSave = {
                ...product,
                images: uploadedImageUrls,
                // Ensure slug is generated if it's a new product
                slug: product.slug || product.translations?.en.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            };

            await upsertProduct(productToSave);

            showToast(t('toast.productSaved'), 'success');
            navigate(ROUTES.ADMIN_PRODUCTS);
        } catch (error) {
            console.error("Failed to save product:", error);
            showToast(t('toast.imageUploadError'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary">
                    {productId ? t('admin.editProduct') : t('admin.createProduct')}
                </h1>
                <div>
                    <Button type="submit" disabled={isLoading} className="w-auto">
                         {isLoading ? t('admin.saving') : t('admin.saveProduct')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => setActiveLangTab(lang.code)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeLangTab === lang.code
                                                ? 'border-secondary text-primary'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="py-6 space-y-4">
                            <input name="title" value={product.translations?.[activeLangTab]?.title || ''} onChange={handleTranslationChange} placeholder={t('admin.productName')} className="w-full text-2xl font-bold border-gray-300 rounded-md" required />
                            <textarea name="description" value={product.translations?.[activeLangTab]?.description || ''} onChange={handleTranslationChange} placeholder={t('admin.productDescription')} rows={6} className="w-full border-gray-300 rounded-md" />
                            <input name="materials" value={product.translations?.[activeLangTab]?.materials || ''} onChange={handleTranslationChange} placeholder={t('admin.materials')} className="w-full border-gray-300 rounded-md" />
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-bold mb-4">{t('admin.images')}</h2>
                        <div 
                            onDrop={handleImageDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                        >
                            <input type="file" id="imageUpload" multiple onChange={handleImageSelect} accept="image/*" className="hidden" />
                            <label htmlFor="imageUpload" className="cursor-pointer">
                                <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">{t('admin.uploadHint')}</p>
                            </label>
                        </div>
                         {(product.images && product.images.length > 0) || newImages.length > 0 ? (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {product.images?.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img src={image.url} alt={image.alt} className="w-full h-24 object-cover rounded-md" />
                                    </div>
                                ))}
                                {newImages.map((file, index) => (
                                    <div key={index} className="relative group">
                                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-24 object-cover rounded-md" />
                                        <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                         <h3 className="text-lg font-bold">{t('admin.basicInfo')}</h3>
                         <input name="sku" value={product.sku || ''} onChange={handleInputChange} placeholder="SKU" className="w-full border-gray-300 rounded-md" />
                         <select name="status" value={product.status} onChange={handleInputChange} className="w-full border-gray-300 rounded-md">
                            <option value="available">{t('product.available')}</option>
                            <option value="sold">{t('product.sold')}</option>
                            <option value="made-to-order">{t('product.madeToOrder')}</option>
                         </select>
                         <input name="stock" value={product.stock || 0} onChange={handleInputChange} type="number" placeholder="Stock" className="w-full border-gray-300 rounded-md" />
                         <input name="yearCreated" value={product.yearCreated || new Date().getFullYear()} onChange={handleInputChange} type="number" placeholder="Year Created" className="w-full border-gray-300 rounded-md" />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                         <h3 className="text-lg font-bold">{t('admin.pricing')}</h3>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                            <input name="price.amount" value={product.price?.amount || 0} onChange={handleInputChange} type="number" placeholder="Price" className="w-full pl-7 border-gray-300 rounded-md" />
                         </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                         <h3 className="text-lg font-bold">{t('admin.dimensions')}</h3>
                         <input name="dimensions.width" value={product.dimensions?.width || ''} onChange={handleInputChange} type="number" placeholder="Width (cm)" className="w-full border-gray-300 rounded-md" />
                         <input name="dimensions.height" value={product.dimensions?.height || ''} onChange={handleInputChange} type="number" placeholder="Height (cm)" className="w-full border-gray-300 rounded-md" />
                         <input name="dimensions.depth" value={product.dimensions?.depth || ''} onChange={handleInputChange} type="number" placeholder="Depth (cm)" className="w-full border-gray-300 rounded-md" />
                         <input name="weight" value={product.weight || ''} onChange={handleInputChange} type="number" placeholder="Weight (kg)" className="w-full border-gray-300 rounded-md" />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ProductEditPage;
