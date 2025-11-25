
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '../../lib/validators/product';
import { Product, ProductCategory, ProductImage } from '../../types/product';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Upload, Trash2, Star, Image as ImageIcon, Languages, Box, Tag, Globe, Loader2 } from 'lucide-react';
import { uploadImage, getPublicUrl, STORAGE_BUCKET } from '../../lib/supabase/storage';
import { createDocument, updateDocument } from '../../lib/firebase/firestore';
import { cn } from '../../lib/utils';
import { useToast } from '../ui/Toast';

interface ProductFormProps {
  initialData?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TABS = [
  { id: 'general', label: 'Geral', icon: Box },
  { id: 'images', label: 'Imagens', icon: ImageIcon },
  { id: 'fr', label: 'Français', icon: Languages },
  { id: 'en', label: 'English', icon: Languages },
  { id: 'pt', label: 'Português', icon: Languages },
  { id: 'de', label: 'Deutsch', icon: Languages },
  { id: 'seo', label: 'SEO', icon: Globe },
];

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [images, setImages] = useState<ProductImage[]>(initialData?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const defaultValues: any = {
    sku: '',
    slug: '',
    price: 0,
    stock: 1,
    category: ProductCategory.PAINTINGS,
    status: 'active',
    featured: false,
    displayOrder: 0,
    dimensions: { height: 0, width: 0, depth: 0, unit: 'cm' },
    weight: 0,
    medium: '',
    year: new Date().getFullYear(),
    framing: 'unframed',
    authenticity_certificate: true,
    signature: true,
    translations: {
        fr: { title: '', description: '', material_label: '' },
        en: { title: '', description: '', material_label: '' },
        pt: { title: '', description: '', material_label: '' },
        de: { title: '', description: '', material_label: '' },
    },
    tags: ''
  };

  // Cast resolver to any to avoid strict type mismatch between Zod inference and RHF generics
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData ? {
        ...initialData,
        tags: initialData.tags?.join(', ') || ''
    } as any : defaultValues
  });

  // Auto-generate slug from English title if empty
  const enTitle = watch('translations.en.title');
  useEffect(() => {
    if (enTitle && !initialData) {
        const slug = enTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setValue('slug', slug);
    }
  }, [enTitle, initialData, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImg(true);
    try {
        const newImages: ProductImage[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Fix: Use correct bucket and 'products' folder
            const fileName = `products/prod-${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const { path } = await uploadImage(STORAGE_BUCKET, file, fileName);
            const url = getPublicUrl(STORAGE_BUCKET, path);
            
            newImages.push({
                id: Math.random().toString(36).substr(2, 9),
                url,
                alt: file.name,
                isThumbnail: images.length === 0 && i === 0 // First image is default thumbnail
            });
        }
        setImages([...images, ...newImages]);
        toast(`${newImages.length} imagens enviadas`, "success");
    } catch (err) {
        console.error(err);
        toast("Erro ao enviar imagens", "error");
    } finally {
        setUploadingImg(false);
    }
  };

  const setThumbnail = (id: string) => {
    setImages(images.map(img => ({ ...img, isThumbnail: img.id === id })));
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (images.length === 0) {
        toast("Adicione pelo menos uma imagem", "error");
        return;
    }

    setIsSubmitting(true);
    try {
        const payload: Partial<Product> = {
            ...data,
            // Convert comma separated tags to array
            tags: (data.tags as unknown as string).split(',').map(t => t.trim()).filter(Boolean),
            images,
            updatedAt: new Date().toISOString()
        };

        if (initialData?.id) {
            await updateDocument('products', initialData.id, payload);
            toast("Produto atualizado!", "success");
        } else {
            await createDocument('products', {
                ...payload,
                createdAt: new Date().toISOString()
            });
            toast("Produto criado!", "success");
        }
        onSuccess();
    } catch (error) {
        console.error(error);
        toast("Erro ao salvar produto", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  const Input = ({ label, name, type = "text", placeholder, error }: any) => (
      <div className="mb-4">
          <label className="block text-xs uppercase text-gray-400 mb-1 tracking-wider">{label}</label>
          <input 
            {...register(name)} 
            type={type} 
            step={type === 'number' ? "0.01" : undefined}
            placeholder={placeholder}
            className={cn(
                "w-full bg-black/20 border rounded p-3 text-sm text-white focus:outline-none focus:border-accent transition-colors",
                error ? "border-red-500" : "border-white/10"
            )} 
          />
          {error && <span className="text-red-500 text-xs mt-1">{error.message}</span>}
      </div>
  );

  const TextArea = ({ label, name, rows = 4, placeholder }: any) => (
      <div className="mb-4">
          <label className="block text-xs uppercase text-gray-400 mb-1 tracking-wider">{label}</label>
          <textarea 
            {...register(name)} 
            rows={rows} 
            placeholder={placeholder}
            className="w-full bg-black/20 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
          />
      </div>
  );

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
        <motion.div 
            {...({
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.95 }
            } as any)}
            className="w-full max-w-6xl bg-[#121212] border border-white/10 rounded-2xl flex flex-col h-[90vh] shadow-2xl"
        >
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1a1a1a]">
                <h2 className="font-serif text-xl text-white">
                    {initialData ? `Editar: ${initialData.translations?.fr?.title}` : 'Nova Obra de Arte'}
                </h2>
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancelar</button>
                    <button 
                        onClick={handleSubmit(onSubmit)} 
                        disabled={isSubmitting}
                        className="bg-accent text-white px-6 py-2 rounded font-bold uppercase text-xs tracking-widest hover:bg-accent/80 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        Salvar Produto
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-20 md:w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col py-4 overflow-y-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-4 transition-all text-sm font-medium",
                                activeTab === tab.id 
                                    ? "bg-white/5 text-accent border-r-2 border-accent" 
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={18} />
                            <span className="hidden md:inline">{tab.label}</span>
                            {activeTab !== tab.id && errors?.translations?.[tab.id as keyof typeof errors.translations] && (
                                <span className="w-2 h-2 rounded-full bg-red-500 ml-auto" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Form Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#121212]">
                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                            <div className="space-y-6">
                                <h3 className="text-lg font-serif text-white border-b border-white/10 pb-2 mb-6">Informações Básicas</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="SKU (Código Interno)" name="sku" placeholder="ART-001" error={errors.sku} />
                                    <div className="mb-4">
                                        <label className="block text-xs uppercase text-gray-400 mb-1 tracking-wider">Categoria</label>
                                        <select {...register('category')} className="w-full bg-black/20 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent">
                                            {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Preço (€)" name="price" type="number" error={errors.price} />
                                    <Input label="Estoque" name="stock" type="number" error={errors.stock} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-xs uppercase text-gray-400 mb-1 tracking-wider">Status</label>
                                        <select {...register('status')} className="w-full bg-black/20 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent">
                                            <option value="active">Ativo (Visível)</option>
                                            <option value="draft">Rascunho (Oculto)</option>
                                            <option value="sold">Vendido</option>
                                            <option value="reserved">Reservado</option>
                                        </select>
                                    </div>
                                    <Input label="Ordem de Exibição" name="displayOrder" type="number" />
                                </div>
                                <div className="flex items-center gap-3 p-4 border border-white/10 rounded bg-white/5">
                                    <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-accent" />
                                    <label className="text-sm text-white">Destaque na Home</label>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-serif text-white border-b border-white/10 pb-2 mb-6">Especificações Técnicas</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <Input label="Altura" name="dimensions.height" type="number" />
                                    <Input label="Largura" name="dimensions.width" type="number" />
                                    <Input label="Profundidade" name="dimensions.depth" type="number" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-xs uppercase text-gray-400 mb-1 tracking-wider">Unidade</label>
                                        <select {...register('dimensions.unit')} className="w-full bg-black/20 border border-white/10 rounded p-3 text-sm text-white">
                                            <option value="cm">Centímetros (cm)</option>
                                            <option value="in">Polegadas (in)</option>
                                        </select>
                                    </div>
                                    <Input label="Peso (kg)" name="weight" type="number" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Meio / Técnica (Interno)" name="medium" placeholder="Ex: Oil, Acrylic" />
                                    <Input label="Ano de Criação" name="year" type="number" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs uppercase text-gray-400 mb-1 tracking-wider">Emolduramento</label>
                                    <select {...register('framing')} className="w-full bg-black/20 border border-white/10 rounded p-3 text-sm text-white">
                                        <option value="unframed">Sem Moldura (Unframed)</option>
                                        <option value="framed">Com Moldura (Framed)</option>
                                        <option value="not_applicable">Não Aplicável</option>
                                    </select>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" {...register('authenticity_certificate')} className="w-4 h-4 accent-accent" />
                                        <label className="text-sm text-gray-300">Certificado Autenticidade</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" {...register('signature')} className="w-4 h-4 accent-accent" />
                                        <label className="text-sm text-gray-300">Assinado pela Artista</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* IMAGES TAB */}
                    {activeTab === 'images' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-serif text-white">Galeria da Obra</h3>
                                    <p className="text-xs text-gray-500">Arraste para reordenar (Em breve). A primeira imagem com estrela é a capa.</p>
                                </div>
                                <label className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2 transition-colors">
                                    {uploadingImg ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
                                    Adicionar Imagens
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {images.map((img, index) => (
                                    <div key={img.id} className={cn("relative group aspect-square rounded-lg overflow-hidden border-2 transition-all", img.isThumbnail ? "border-accent" : "border-white/10")}>
                                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <button 
                                                onClick={() => setThumbnail(img.id)}
                                                className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase", img.isThumbnail ? "bg-accent text-white" : "bg-white text-black hover:bg-accent hover:text-white")}
                                            >
                                                {img.isThumbnail ? 'Capa Principal' : 'Definir Capa'}
                                            </button>
                                            <button onClick={() => removeImage(img.id)} className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {img.isThumbnail && <div className="absolute top-2 right-2 text-accent"><Star fill="currentColor" size={20}/></div>}
                                    </div>
                                ))}
                                {images.length === 0 && (
                                    <div className="col-span-full py-20 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-gray-500">
                                        <ImageIcon size={48} className="mb-4 opacity-50" />
                                        <p>Nenhuma imagem adicionada.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* LANGUAGES TABS */}
                    {['fr', 'en', 'pt', 'de'].includes(activeTab) && (
                        <div className="animate-fade-in max-w-3xl">
                             <h3 className="text-lg font-serif text-white border-b border-white/10 pb-2 mb-6 capitalize">
                                Tradução: {TABS.find(t => t.id === activeTab)?.label}
                             </h3>
                             <Input label="Título da Obra" name={`translations.${activeTab}.title`} placeholder="Ex: Sunset in Luxembourg" />
                             <Input label="Rótulo do Material (Visível ao cliente)" name={`translations.${activeTab}.material_label`} placeholder="Ex: Oil on Canvas / Óleo sobre Tela" />
                             <TextArea label="Descrição Completa" name={`translations.${activeTab}.description`} rows={8} />
                             
                             <div className="mt-8 pt-8 border-t border-white/5">
                                <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><Globe size={14}/> SEO Específico ({activeTab.toUpperCase()})</h4>
                                <Input label="Meta Title" name={`translations.${activeTab}.seo_title`} placeholder="Se vazio, usa o título principal" />
                                <TextArea label="Meta Description" name={`translations.${activeTab}.seo_description`} rows={2} />
                             </div>
                        </div>
                    )}

                    {/* SEO TAB */}
                    {activeTab === 'seo' && (
                        <div className="animate-fade-in max-w-3xl space-y-6">
                            <h3 className="text-lg font-serif text-white border-b border-white/10 pb-2 mb-6">Otimização para Buscas (Global)</h3>
                            <Input label="URL Amigável (Slug)" name="slug" placeholder="ex: sunset-luxembourg-collection" error={errors.slug} />
                            <p className="text-xs text-gray-500 -mt-2 mb-4">A URL única do produto. Gerada automaticamente do título em inglês se vazia.</p>
                            
                            <Input label="Tags (Separadas por vírgula)" name="tags" placeholder="abstract, blue, luxury, large format" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    </div>
  );
};
