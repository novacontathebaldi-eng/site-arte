
import React, { useState, useMemo, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  horizontalListSortingStrategy, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product, Category, ProductCategory } from '../../../types/product';
import { collection, query, orderBy, onSnapshot, writeBatch, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { cn, formatPrice } from '../../../lib/utils';
import { Plus, MoreHorizontal, Trash2, Edit, GripVertical, CheckSquare, Square, X, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../ui/Toast';
import { ProductForm } from '../ProductForm';
import { useLanguage } from '../../../hooks/useLanguage';

// --- Types ---
type SortableData = {
  type: 'Column' | 'Item';
  item: any;
}

// --- Category Seed Logic ---
const seedCategories = async () => {
    const batch = writeBatch(db);
    const enumValues = Object.values(ProductCategory);
    
    enumValues.forEach((slug, idx) => {
        const ref = doc(collection(db, 'categories'));
        batch.set(ref, {
            slug,
            displayOrder: idx,
            translations: {
                fr: { title: slug.charAt(0).toUpperCase() + slug.slice(1) },
                en: { title: slug.charAt(0).toUpperCase() + slug.slice(1) },
                pt: { title: slug.charAt(0).toUpperCase() + slug.slice(1) },
                de: { title: slug.charAt(0).toUpperCase() + slug.slice(1) },
            }
        });
    });
    await batch.commit();
};

// --- Components ---

const BoardItem = ({ product, isOverlay, onEdit, isSelected, toggleSelect }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: product.id,
        data: { type: 'Item', item: product }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1
    };

    const imgUrl = product.images?.[0]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : null);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "bg-[#1a1a1a] p-3 rounded-lg border border-white/5 shadow-sm mb-3 group relative hover:border-white/20 transition-all",
                isSelected && "border-accent bg-accent/5"
            )}
        >
            <div className="flex gap-3">
                <div className="w-12 h-12 rounded bg-black flex-shrink-0 overflow-hidden">
                    {imgUrl && <img src={imgUrl} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{product.translations?.fr?.title || 'Untitled'}</h4>
                    <p className="text-xs text-gray-500 font-mono">{formatPrice(product.price)}</p>
                </div>
            </div>
            
            {/* Actions overlay */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="p-1.5 bg-white/10 hover:bg-white text-white hover:text-black rounded">
                    <Edit size={12} />
                 </button>
            </div>
            
            {/* Selection Checkbox */}
            <button 
                className="absolute bottom-2 right-2 text-gray-500 hover:text-accent"
                onPointerDown={(e) => { e.stopPropagation(); toggleSelect(product.id); }}
            >
                {isSelected ? <CheckSquare size={16} className="text-accent"/> : <Square size={16}/>}
            </button>
        </div>
    );
};

const BoardColumn = ({ category, products, isOverlay, onEditCat, onDeleteCat }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: category.id,
        data: { type: 'Column', item: category }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full w-[300px] flex flex-col bg-[#121212] rounded-xl border border-white/5 flex-shrink-0 mr-4">
            <div className="p-4 border-b border-white/5 flex items-center justify-between cursor-grab active:cursor-grabbing bg-[#151515] rounded-t-xl group" {...attributes} {...listeners}>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm uppercase tracking-wider text-gray-300">
                        {category.translations?.fr?.title || category.slug}
                    </span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px] text-gray-500">
                        {products.length}
                    </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEditCat} className="p-1 hover:text-white text-gray-500"><Edit size={14}/></button>
                    <button onClick={onDeleteCat} className="p-1 hover:text-red-500 text-gray-500"><Trash2 size={14}/></button>
                </div>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto">
                <SortableContext items={products.map((p:any) => p.id)} strategy={verticalListSortingStrategy}>
                    {products.map((p: any) => (
                        <BoardItem 
                            key={p.id} 
                            product={p} 
                            onEdit={(prod: any) => window.dispatchEvent(new CustomEvent('edit-product', { detail: prod }))}
                            isSelected={(window as any).selectedItems?.includes(p.id)} 
                            toggleSelect={(id: string) => window.dispatchEvent(new CustomEvent('toggle-select', { detail: id }))}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

export const ProductsBoard = () => {
    const { t } = useToast();
    const { t: trans } = useLanguage();
    
    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    
    // UI State
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null); // Null = Create Mode if modal open
    const [showCatModal, setShowCatModal] = useState(false);
    const [catFormTitle, setCatFormTitle] = useState('');
    const [catFormSlug, setCatFormSlug] = useState('');

    // Global Event Listeners hack for sub-components interaction
    useEffect(() => {
        const handleEdit = (e: any) => { setEditProduct(e.detail); setShowProductForm(true); };
        const handleSelect = (e: any) => {
            const id = e.detail;
            setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        };
        // Expose to window for sub-components (cleaner than prop drilling 5 levels deep in DnD)
        (window as any).selectedItems = selectedItems;
        
        window.addEventListener('edit-product', handleEdit);
        window.addEventListener('toggle-select', handleSelect);
        return () => {
            window.removeEventListener('edit-product', handleEdit);
            window.removeEventListener('toggle-select', handleSelect);
        }
    }, [selectedItems]);

    // Firestore Listeners
    useEffect(() => {
        // Categories
        const qCat = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
        const unsubCat = onSnapshot(qCat, (snap) => {
            if (snap.empty) {
                seedCategories(); // Auto-seed if empty
            } else {
                setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
            }
        });

        // Products
        const qProd = query(collection(db, 'products'), orderBy('displayOrder', 'asc'));
        const unsubProd = onSnapshot(qProd, (snap) => {
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        });

        return () => { unsubCat(); unsubProd(); };
    }, []);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- Actions ---

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;
        
        const activeId = active.id;
        const overId = over.id;

        const isActiveProduct = active.data.current?.type === 'Item';
        const isOverProduct = over.data.current?.type === 'Item';
        const isOverColumn = over.data.current?.type === 'Column';

        if (isActiveProduct && isOverColumn) {
             // Moving product to empty column or over column header
             const product = products.find(p => p.id === activeId);
             const category = categories.find(c => c.id === overId);
             
             if (product && category && product.category !== category.slug) {
                // Optimistic update
                setProducts(prev => prev.map(p => p.id === activeId ? { ...p, category: category.slug } : p));
             }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        // Column Reordering
        if (active.data.current?.type === 'Column' && over.data.current?.type === 'Column') {
            if (active.id !== over.id) {
                const oldIndex = categories.findIndex(c => c.id === active.id);
                const newIndex = categories.findIndex(c => c.id === over.id);
                const newCats = arrayMove(categories, oldIndex, newIndex);
                setCategories(newCats); // Optimistic
                
                // Batch Update
                const batch = writeBatch(db);
                newCats.forEach((cat, idx) => {
                    batch.update(doc(db, 'categories', cat.id), { displayOrder: idx });
                });
                await batch.commit();
            }
        }

        // Product Reordering / Moving
        if (active.data.current?.type === 'Item') {
            const activeProd = products.find(p => p.id === active.id);
            const overProd = products.find(p => p.id === over.id);
            const overCol = categories.find(c => c.id === over.id);

            if (!activeProd) return;

            // Scenario 1: Moved into a Column (via DragOver logic mostly, but final commit here)
            let newCategorySlug = activeProd.category;
            
            if (overCol) {
                newCategorySlug = overCol.slug;
            } else if (overProd) {
                newCategorySlug = overProd.category;
            }

            // Update category if changed
            if (activeProd.category !== newCategorySlug) {
                 await updateDoc(doc(db, 'products', activeProd.id), { category: newCategorySlug });
            }

            // Reorder within list
            if (active.id !== over.id && overProd) {
                 const currentCatProducts = products.filter(p => p.category === newCategorySlug);
                 const oldIndex = currentCatProducts.findIndex(p => p.id === active.id);
                 const newIndex = currentCatProducts.findIndex(p => p.id === over.id);
                 
                 const reordered = arrayMove(currentCatProducts, oldIndex, newIndex);
                 
                 // Save order
                 const batch = writeBatch(db);
                 reordered.forEach((p, idx) => {
                     batch.update(doc(db, 'products', p.id), { displayOrder: idx });
                 });
                 await batch.commit();
            }
        }
    };

    // Category CRUD
    const handleSaveCategory = async () => {
        if (!catFormTitle || !catFormSlug) return;
        
        try {
            if (editCategory) {
                await updateDoc(doc(db, 'categories', editCategory.id), {
                    slug: catFormSlug,
                    'translations.fr.title': catFormTitle // Simplify for demo, ideally full form
                });
            } else {
                await addDoc(collection(db, 'categories'), {
                    slug: catFormSlug,
                    displayOrder: categories.length,
                    translations: {
                        fr: { title: catFormTitle },
                        en: { title: catFormTitle },
                        pt: { title: catFormTitle },
                        de: { title: catFormTitle },
                    }
                });
            }
            setShowCatModal(false);
            setCatFormTitle(''); setCatFormSlug(''); setEditCategory(null);
            t("Categoria salva", "success");
        } catch(e) { console.error(e); t("Erro ao salvar", "error"); }
    };

    const handleDeleteCategory = async (cat: Category) => {
        const hasProducts = products.some(p => p.category === cat.slug);
        if (hasProducts) {
            t(trans('admin.catalog.delete_error'), "error");
            return;
        }
        if (confirm("Confirmar exclusão?")) {
            await deleteDoc(doc(db, 'categories', cat.id));
            t("Categoria removida", "success");
        }
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (!confirm(`Excluir ${selectedItems.length} itens?`)) return;
        try {
            const batch = writeBatch(db);
            selectedItems.forEach(id => batch.delete(doc(db, 'products', id)));
            await batch.commit();
            setSelectedItems([]);
            t("Itens excluídos", "success");
        } catch(e) { t("Erro ao excluir", "error"); }
    };

    const activeItem = activeId ? (products.find(p => p.id === activeId) || categories.find(c => c.id === activeId)) : null;

    return (
        <div className="h-full flex flex-col">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex gap-3">
                    <button 
                        onClick={() => { setEditProduct(null); setShowProductForm(true); }}
                        className="bg-accent text-white px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-accent/80 flex items-center gap-2"
                    >
                        <Plus size={16}/> {trans('admin.catalog.add_product')}
                    </button>
                    <button 
                        onClick={() => { setEditCategory(null); setCatFormTitle(''); setCatFormSlug(''); setShowCatModal(true); }}
                        className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-white/20 flex items-center gap-2"
                    >
                        <FolderPlus size={16}/> {trans('admin.catalog.new_category')}
                    </button>
                </div>
                
                <div className="text-gray-500 text-xs">
                    {products.length} Products • {categories.length} Categories
                </div>
            </div>

            {/* Kanban Board */}
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCorners} 
                onDragStart={handleDragStart} 
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex h-full w-max px-1">
                        <SortableContext items={categories.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                            {categories.map(cat => (
                                <BoardColumn 
                                    key={cat.id} 
                                    category={cat} 
                                    products={products.filter(p => p.category === cat.slug)}
                                    onEditCat={() => { setEditCategory(cat); setCatFormTitle(cat.translations.fr.title); setCatFormSlug(cat.slug); setShowCatModal(true); }}
                                    onDeleteCat={() => handleDeleteCategory(cat)}
                                />
                            ))}
                        </SortableContext>
                    </div>
                </div>

                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                    {activeItem && (
                        'slug' in activeItem ? (
                             <div className="w-[300px] h-full bg-[#121212] rounded-xl border border-accent opacity-90 p-4">
                                <span className="font-bold text-gray-300">{activeItem.slug}</span>
                             </div>
                        ) : (
                             <div className="w-[280px] bg-[#1a1a1a] p-3 rounded-lg border border-accent shadow-xl">
                                 <h4 className="text-sm font-medium text-white">{activeItem.translations?.fr?.title}</h4>
                             </div>
                        )
                    )}
                </DragOverlay>
            </DndContext>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedItems.length > 0 && (
                    <motion.div 
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-white/10 rounded-full shadow-2xl px-6 py-3 flex items-center gap-6"
                    >
                        <span className="text-sm font-bold text-white">{selectedItems.length} {trans('admin.catalog.items_selected')}</span>
                        <div className="h-6 w-px bg-white/10" />
                        <button onClick={handleBulkDelete} className="text-red-500 hover:text-red-400 font-bold uppercase text-xs flex items-center gap-2">
                            <Trash2 size={16}/> {trans('admin.catalog.bulk_delete')}
                        </button>
                        <button onClick={() => setSelectedItems([])} className="text-gray-500 hover:text-white"><X size={16}/></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            {showProductForm && (
                <ProductForm 
                    initialData={editProduct} 
                    onClose={() => { setShowProductForm(false); setEditProduct(null); }} 
                    onSuccess={() => { setShowProductForm(false); setEditProduct(null); }} 
                />
            )}

            {showCatModal && (
                <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#121212] p-8 rounded-xl border border-white/10 w-full max-w-md">
                        <h3 className="text-xl font-serif text-white mb-6">{editCategory ? trans('admin.catalog.edit_category') : trans('admin.catalog.new_category')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">Nome (Label)</label>
                                <input value={catFormTitle} onChange={e => setCatFormTitle(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-accent outline-none" placeholder="Ex: Pinturas" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">Slug (ID Interno)</label>
                                <input value={catFormSlug} onChange={e => setCatFormSlug(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-accent outline-none" placeholder="Ex: paintings" />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowCatModal(false)} className="flex-1 py-3 text-gray-500 hover:text-white">Cancelar</button>
                            <button onClick={handleSaveCategory} className="flex-1 py-3 bg-accent text-white font-bold rounded hover:bg-accent/80">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
