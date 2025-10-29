import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Painting, Category, CartItem, OrderDetails, SiteSettings, Order, OrderStatus, PaymentStatus, ChatMessage, ReservationDetails, UserProfile, DaySchedule } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { GallerySection as MenuSection } from './components/MenuSection';
import { AboutSection } from './components/AboutSection';
import { DynamicContentSection } from './components/DynamicContentSection';
import { ContactSection } from './components/ContactSection';
import { AdminSection } from './components/AdminSection';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal, OrderConfirmationModal, ReservationConfirmationModal } from './components/CheckoutModal';
import { ReservationModal } from './components/ReservationModal';
import { Chatbot } from '@/components/Chatbot';
import { LoginModal } from '@/components/LoginModal';
import { UserAreaModal } from '@/components/UserAreaModal';
import { db, auth } from './services/firebase';
import * as firebaseService from './services/firebaseService';
import { seedDatabase } from './services/seed';
import defaultLogo from './assets/logo_art.png';
import defaultHeroBg from './assets/art_gallery_bg.jpg';
import defaultAboutImg from './assets/artist_photo.jpg';
import firebase from 'firebase/compat/app';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';
import { HalfAndHalfModal } from './components/HalfAndHalfModal';
import { PixQrCodeModal } from './components/PixQrCodeModal';

declare global {
    interface Window {
        gapi: any;
        googleScriptLoaded: boolean;
        onGoogleScriptLoadCallback: () => void;
    }
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

const defaultSiteSettings: SiteSettings = {
    logoUrl: defaultLogo,
    heroSlogan: "L'art qui raconte une histoire",
    heroTitle: "Andressa Pelussi Art Gallery",
    heroSubtitle: "Plongez dans un univers de couleurs et d'émotions. Chaque œuvre est une fenêtre ouverte sur l'âme de l'artiste.",
    heroBgUrl: defaultHeroBg,
    automaticSchedulingEnabled: true,
    operatingHours: [
        { dayOfWeek: 0, dayName: 'Dimanche', isOpen: false, openTime: '10:00', closeTime: '18:00' },
        { dayOfWeek: 1, dayName: 'Lundi', isOpen: false, openTime: '10:00', closeTime: '18:00' },
        { dayOfWeek: 2, dayName: 'Mardi', isOpen: true, openTime: '10:00', closeTime: '18:00' },
        { dayOfWeek: 3, dayName: 'Mercredi', isOpen: true, openTime: '10:00', closeTime: '18:00' },
        { dayOfWeek: 4, dayName: 'Jeudi', isOpen: true, openTime: '10:00', closeTime: '18:00' },
        { dayOfWeek: 5, dayName: 'Vendredi', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { dayOfWeek: 6, dayName: 'Samedi', isOpen: true, openTime: '10:00', closeTime: '20:00' },
    ],
    contentSections: [
        {
            id: 'about-section-placeholder',
            order: 0,
            isVisible: true,
            imageUrl: defaultAboutImg,
            tag: "L'Artiste",
            title: "Andressa Pelussi",
            description: "Description de l'artiste...",
            list: [],
        }
    ],
    footerLinks: [
        { id: 'footer-instagram', icon: 'fab fa-instagram', text: 'Instagram', url: 'https://instagram.com/meehpelussi', isVisible: true },
        { id: 'footer-admin', icon: 'fas fa-key', text: 'Administration', url: '#admin', isVisible: true }
    ]
};

// FIX: Refactored function signature to accept the whole Order object, resolving a type mismatch.
const generateWhatsAppMessage = (order: Order, currentCart: (Omit<CartItem, 'imageUrl'>)[]) => {
    const details = order.customer;
    const total = order.total ?? 0;
    const orderNumber = order.orderNumber;
    const isPaid = order.paymentStatus === 'paid' || order.paymentStatus === 'paid_online';
    const paymentMethodMap = { credit: 'Carte de crédit', debit: 'Carte de débit', pix: 'Virement bancaire', cash: 'Espèces' };
    const orderNumStr = orderNumber ? ` #${orderNumber}` : '';

    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR');
    const formattedTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let message = `*🎨 NOUVELLE COMMANDE - GALERIE D'ART${orderNumStr}*\n\n`;
    message += `🗓️ *Date:* ${formattedDate}\n`;
    message += `⏰ *Heure:* ${formattedTime}\n\n`;
    message += `*Type:* ${details.orderType === 'delivery' ? 'Livraison 🚚' : 'Retrait en galerie 🛍️'}\n\n`;

    if (isPaid) {
        message += `*✅ PAYÉ EN LIGNE*\n\n`;
    }

    message += `*👤 COORDONNÉES DU CLIENT:*\n`;
    message += `*Nom:* ${details.name}\n`;
    message += `*Téléphone:* ${details.phone}\n`;

    if (details.orderType === 'delivery') {
        message += `\n*📍 ADRESSE DE LIVRAISON:*\n`;
        message += `${details.street}, ${details.number}\n`;
        if (details.complement) {
            message += `${details.complement}\n`;
        }
        message += `${details.neighborhood}, ${details.city}\n`;
    }

    message += `\n*🖼️ ŒUVRES COMMANDÉES:*\n`;
    currentCart.forEach(item => {
        message += `• 1x ${item.name} (${item.dimensions}) - ${item.price.toLocaleString('fr-LU', { style: 'currency', currency: 'EUR' })}\n`;
    });

    const subtotal = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    message += `\n*🧾 RÉSUMÉ FINANCIER:*\n`;
    message += `*Sous-total:* ${subtotal.toLocaleString('fr-LU', { style: 'currency', currency: 'EUR' })}\n`;
    if (details.orderType === 'delivery' && order.deliveryFee) {
        message += `*Frais de livraison:* ${order.deliveryFee.toLocaleString('fr-LU', { style: 'currency', currency: 'EUR' })}\n`;
    }
    message += `*TOTAL: ${total.toLocaleString('fr-LU', { style: 'currency', currency: 'EUR' })}*\n\n`;

    message += `*💳 PAIEMENT:*\n`;
    if (order.paymentMethod) {
        message += `*Méthode:* ${paymentMethodMap[order.paymentMethod]}\n`;
    }
    
    if (order.notes) {
        message += `\n*📝 NOTES:*\n${order.notes}\n`;
    }
    message += `\nMerci d'avoir choisi une de mes œuvres ! ✨`;

    return `https://wa.me/352661803204?text=${encodeURIComponent(message)}`; // Replace with a Luxembourg number if available
};

const generateReservationWhatsAppMessage = (details: ReservationDetails, orderNumber: number | null) => {
    const orderNumStr = orderNumber ? ` #${orderNumber}` : '';
    let message = `*📅 NOUVELLE DEMANDE DE VISITE${orderNumStr} 📅*\n\n`;
    message += `Une nouvelle demande de visite a été faite via le site.\n\n`;
    message += `*👤 COORDONNÉES:*\n`;
    message += `*Nom:* ${details.name}\n`;
    message += `*Téléphone:* ${details.phone}\n\n`;
    message += `*📋 DÉTAILS DE LA VISITE:*\n`;
    const [year, month, day] = details.reservationDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    message += `*Date souhaitée:* ${formattedDate}\n`;
    message += `*Heure souhaitée:* ${details.reservationTime}\n`;
    message += `*Nombre de personnes:* ${details.numberOfPeople}\n`;
    if (details.notes) {
        message += `\n*📝 NOTES:*\n${details.notes}\n`;
    }
    message += `\nMerci ! Je reviendrai vers vous pour confirmer le rendez-vous. ✨`;

    return `https://wa.me/352661803204?text=${encodeURIComponent(message)}`;
};

const App: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [paintings, setPaintings] = useState<Painting[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isStoreOnline, setIsStoreOnline] = useState<boolean>(true);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState('Accueil');
    const [activeMenuCategory, setActiveMenuCategory] = useState<string>('');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState<boolean>(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [showFloatingButton, setShowFloatingButton] = useState(false);
    const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState<boolean>(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
    const [showCookieBanner, setShowCookieBanner] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [isUserAreaModalOpen, setIsUserAreaModalOpen] = useState<boolean>(false);
    const [passwordResetCode, setPasswordResetCode] = useState<string | null>(null);
    const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState<boolean>(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessingOrder, setIsProcessingOrder] = useState<boolean>(false);
    const [confirmedOrderData, setConfirmedOrderData] = useState<Order | null>(null);
    const [confirmedReservationData, setConfirmedReservationData] = useState<Order | null>(null);
    const [isPixQrCodeModalOpen, setIsPixQrCodeModalOpen] = useState(false);
    const [isHalfAndHalfModalOpen, setIsHalfAndHalfModalOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'bot', content: `Bonjour ! Je suis l'assistant virtuel de la galerie d'art d'Andressa Pelussi. Comment puis-je vous aider aujourd'hui ?` }
    ]);
    const [isBotReplying, setIsBotReplying] = useState<boolean>(false);
    const prevUser = useRef<firebase.User | null>(null);
    const [userAreaInitialTab, setUserAreaInitialTab] = useState<'profile' | 'orders' | 'addresses'>('orders');
    const [userAreaShowAddAddress, setUserAreaShowAddAddress] = useState(false);
    
    useEffect(() => {
        const consent = localStorage.getItem('artGalleryCookieConsent');
        if (!consent) {
            setShowCookieBanner(true);
        }
    }, []);

    const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 4000);
    }, []);
    
    useEffect(() => {
        if (!auth) {
            setIsAuthLoading(false);
            return;
        }
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            if (user) {
                const profile = await firebaseService.getUserProfile(user.uid);
                setUserProfile(profile);
                if (profile?.name) setName(profile.name);
                if (profile?.phone) setPhone(profile.phone);
                const idTokenResult = await user.getIdTokenResult(true);
                setIsCurrentUserAdmin(idTokenResult.claims.admin === true);
            } else {
                setUserProfile(null);
                setName('');
                setPhone('');
                setIsCurrentUserAdmin(false);
            }
            setIsAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!db) { setError("La connexion à la base de données a échoué."); setIsLoading(false); return; }
        
        const handleConnectionError = (err: Error, context: string) => { 
            console.error(`Error fetching ${context}:`, err); 
            setError("Impossible de se connecter à la base de données."); 
            setIsLoading(false); 
        };
        
        const handleAuthConnectionError = (err: any, context: string) => {
            console.error(`Error fetching ${context}:`, err);
            if (err.code !== 'permission-denied') {
                setError("Impossible de se connecter à la base de données.");
                setIsLoading(false);
            }
        };

        const unsubSettings = db.doc('store_config/site_settings').onSnapshot(doc => { if (doc.exists) setSiteSettings(prev => ({ ...defaultSiteSettings, ...prev, ...doc.data() as Partial<SiteSettings> })); }, err => handleConnectionError(err, "site settings"));
        const unsubStatus = db.doc('store_config/status').onSnapshot(doc => { if (doc.exists) setIsStoreOnline(doc.data()?.isOpen); }, err => handleConnectionError(err, "store status"));
        const unsubProducts = db.collection('paintings').orderBy('orderIndex').onSnapshot(snapshot => setPaintings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Painting))), err => handleConnectionError(err, "paintings"));
        const unsubCategories = db.collection('categories').orderBy('order').onSnapshot(snapshot => {
            const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            setCategories(cats);
            if (!activeMenuCategory && cats.length > 0) setActiveMenuCategory(cats[0].id);
        }, err => handleConnectionError(err, "categories"));

        let unsubOrders = () => {};
        if (isCurrentUserAdmin) {
            unsubOrders = db.collection('orders').orderBy('createdAt', 'desc').limit(100).onSnapshot(snapshot => setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order))), err => handleAuthConnectionError(err, "orders"));
        } else {
            setOrders([]);
        }

        setIsLoading(false);
        return () => { unsubSettings(); unsubStatus(); unsubProducts(); unsubCategories(); unsubOrders(); };
    }, [isCurrentUserAdmin, activeMenuCategory]);

    const handleSaveProduct = async (product: Painting) => {
        try {
            if (product.id) {
                await firebaseService.updateProduct(product.id, product);
            } else {
                await firebaseService.addProduct(product);
            }
            addToast('Œuvre sauvegardée avec succès !', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erreur lors de la sauvegarde de l\'œuvre.', 'error');
        }
    };
    
    const handleDeleteProduct = async (productId: string) => {
        try {
            await firebaseService.deleteProduct(productId);
            addToast('Œuvre déplacée dans la corbeille.', 'success');
        } catch (error) {
            addToast("Erreur lors de la suppression de l'œuvre.", 'error');
        }
    };

    const handleProductStatusChange = async (productId: string, active: boolean) => {
        try {
            await firebaseService.updateProductStatus(productId, active);
            addToast('Statut de l\'œuvre mis à jour.', 'success');
        } catch (error) {
            addToast("Erreur lors de la mise à jour du statut.", 'error');
        }
    };

    const handleProductStockStatusChange = async (productId: string, stockStatus: 'available' | 'out_of_stock') => {
        try {
            await firebaseService.updateProductStockStatus(productId, stockStatus);
            addToast('Statut du stock mis à jour.', 'success');
        } catch (error) {
            addToast("Erreur lors de la mise à jour du stock.", 'error');
        }
    };

    const handleReorderProducts = async (productsToUpdate: { id: string, orderIndex: number }[]) => {
        try {
            await firebaseService.updateProductsOrder(productsToUpdate);
            addToast('Ordre des œuvres mis à jour.', 'success');
        } catch (error) {
            addToast("Erreur lors de la réorganisation des œuvres.", 'error');
        }
    };

    const handleStoreStatusChange = async (isOnline: boolean) => {
        try {
            await firebaseService.updateStoreStatus(isOnline);
            addToast(`Boutique mise en mode ${isOnline ? 'en ligne' : 'hors ligne'}.`, 'success');
        } catch (error) {
            addToast("Erreur lors de la mise à jour du statut de la boutique.", 'error');
        }
    };

    const handleSaveCategory = async (category: Category) => {
        try {
            if (category.id) {
                await firebaseService.updateCategory(category.id, category);
            } else {
                await firebaseService.addCategory(category);
            }
            addToast('Catégorie sauvegardée avec succès !', 'success');
        } catch (error) {
            addToast("Erreur lors de la sauvegarde de la catégorie.", 'error');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await firebaseService.deleteCategory(categoryId, paintings);
            addToast('Catégorie supprimée.', 'success');
        } catch (error: any) {
            addToast(error.message || "Erreur lors de la suppression de la catégorie.", 'error');
        }
    };
    
    const handleCategoryStatusChange = async (categoryId: string, active: boolean) => {
        try {
            await firebaseService.updateCategoryStatus(categoryId, active);
            addToast('Statut de la catégorie mis à jour.', 'success');
        } catch (error) {
            addToast("Erreur lors de la mise à jour du statut de la catégorie.", 'error');
        }
    };

    const handleReorderCategories = async (categoriesToUpdate: { id: string, order: number }[]) => {
        try {
            await firebaseService.updateCategoriesOrder(categoriesToUpdate);
            addToast('Ordre des catégories mis à jour.', 'success');
        } catch (error) {
            addToast("Erreur lors de la réorganisation des catégories.", 'error');
        }
    };

    const handleSeedDatabase = async () => {
        try {
            await seedDatabase();
            addToast('Base de données initialisée avec des données de test !', 'success');
        } catch (e: any) {
            console.error(e);
            addToast(e.message || "Erreur lors de l'initialisation de la base de données.", 'error');
        }
    };

    const handleSaveSiteSettings = async (settings: SiteSettings, files: { [key: string]: File | null }) => {
        try {
            let updatedSettings = { ...settings };

            for (const key in files) {
                if (files[key]) {
                    const file = files[key] as File;
                    const assetName = key; // e.g., 'logo', 'heroBg'
                    const urlKey = `${assetName}Url` as keyof SiteSettings;
                    const downloadURL = await firebaseService.uploadSiteAsset(file, assetName);
                    
                    if (settings[urlKey] && settings[urlKey] !== defaultSiteSettings[urlKey]) {
                        await firebaseService.deleteImageByUrl(settings[urlKey] as string);
                    }
                    (updatedSettings as any)[urlKey] = downloadURL;
                }
            }
            
            // Handle image URL changes in content sections
            for (let i = 0; i < updatedSettings.contentSections.length; i++) {
                const section = updatedSettings.contentSections[i];
                const fileKey = section.id;
                if (files[fileKey]) {
                    const downloadURL = await firebaseService.uploadSiteAsset(files[fileKey] as File, fileKey);
                    if (section.imageUrl && !section.imageUrl.startsWith('https://picsum.photos')) {
                         await firebaseService.deleteImageByUrl(section.imageUrl);
                    }
                    updatedSettings.contentSections[i].imageUrl = downloadURL;
                } else if(section.imageUrl === 'DELETE_AND_RESET') {
                    const originalUrl = siteSettings.contentSections.find(s => s.id === section.id)?.imageUrl;
                    if(originalUrl) {
                        await firebaseService.deleteImageByUrl(originalUrl);
                    }
                    updatedSettings.contentSections[i].imageUrl = defaultAboutImg; // Reset to default
                }
            }
            
            await firebaseService.updateSiteSettings(updatedSettings);
            addToast('Paramètres du site sauvegardés !', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erreur lors de la sauvegarde des paramètres.', 'error');
        }
    };

    const handleUpdateSiteSettingsField = async (updates: Partial<SiteSettings>) => {
        try {
            await firebaseService.updateSiteSettings(updates);
            addToast('Paramètre mis à jour.', 'success');
        } catch(e) {
            addToast('Erreur lors de la mise à jour du paramètre.', 'error');
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, payload?: any) => {
        try {
            await firebaseService.updateOrderStatus(orderId, status, payload);
            addToast("Statut de la commande mis à jour.", 'success');
        } catch (error) {
            addToast("Erreur lors de la mise à jour du statut.", 'error');
        }
    };

    const handleUpdateOrderPaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
        try {
            await firebaseService.updateOrderPaymentStatus(orderId, paymentStatus);
            addToast("Statut du paiement mis à jour.", 'success');
        } catch (error) {
            addToast("Erreur lors de la mise à jour du paiement.", 'error');
        }
    };

    const handleUpdateOrderReservationTime = async (orderId: string, reservationTime: string) => {
        try {
            await firebaseService.updateOrderReservationTime(orderId, reservationTime);
            addToast("Heure de la réservation mise à jour.", 'success');
        } catch (e) {
            addToast("Erreur lors de la mise à jour de l'heure.", 'error');
        }
    };
    
    const handleAddToCart = useCallback((painting: Painting) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.paintingId === painting.id);
            let newCart;
            if (existingItem) {
                newCart = prevCart.map(item => item.paintingId === painting.id ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                const newItem: CartItem = {
                    id: `${painting.id}`,
                    paintingId: painting.id,
                    name: painting.name,
                    price: painting.isPromotion && painting.promotionalPrice ? painting.promotionalPrice : painting.price,
                    quantity: 1,
                    imageUrl: painting.imageUrl,
                    dimensions: painting.dimensions,
                };
                newCart = [...prevCart, newItem];
            }
            localStorage.setItem('artGalleryCart', JSON.stringify(newCart));
            return newCart;
        });
    }, []);

    const handleConfirmCheckout = async (details: OrderDetails) => {
        setIsProcessingOrder(true);
        try {
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const total = subtotal + (details.deliveryFee || 0);

            const newOrderRef = db.collection('orders').doc();
            
            const { orderId, orderNumber } = await firebaseService.createOrder(details, cart, total, newOrderRef.id);
            
            const finalOrder: Order = {
                id: orderId,
                orderNumber,
                customer: { name: details.name, phone: details.phone, orderType: details.orderType, ...details },
                items: cart,
                total: total,
                deliveryFee: details.deliveryFee,
                paymentMethod: details.paymentMethod,
                notes: details.notes,
                status: 'pending',
                paymentStatus: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: currentUser?.uid,
            };

            setConfirmedOrderData(finalOrder);
            setIsCheckoutModalOpen(false);
            setCart([]);
            localStorage.removeItem('artGalleryCart');
        } catch (error: any) {
            console.error("Error creating order: ", error);
            addToast(error.message || "Erreur lors de la création de la commande.", 'error');
        } finally {
            setIsProcessingOrder(false);
        }
    };

    const handleConfirmReservation = async (details: ReservationDetails) => {
        setIsProcessingOrder(true);
        try {
            const { orderId, orderNumber } = await firebaseService.createReservation(details);
            const newReservation: Order = {
                id: orderId,
                orderNumber,
                customer: {
                    name: details.name,
                    phone: details.phone,
                    orderType: 'local',
                    reservationDate: details.reservationDate,
                    reservationTime: details.reservationTime,
                },
                numberOfPeople: details.numberOfPeople,
                notes: details.notes,
                status: 'pending',
                paymentStatus: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: currentUser?.uid
            };
            setConfirmedReservationData(newReservation);
            setIsReservationModalOpen(false);
        } catch(e: any) {
            addToast(e.message || "Erreur lors de la création de la réservation.", 'error');
        } finally {
            setIsProcessingOrder(false);
        }
    };

    const handleSendWhatsApp = (order: Order) => {
        const messageUrl = generateWhatsAppMessage(order, order.items || []);
        window.open(messageUrl, '_blank');
        setConfirmedOrderData(null);
    };

    const handleSendReservationWhatsApp = (reservation: Order) => {
        const details: ReservationDetails = {
            name: reservation.customer.name,
            phone: reservation.customer.phone,
            numberOfPeople: reservation.numberOfPeople || 1,
            reservationDate: reservation.customer.reservationDate || '',
            reservationTime: reservation.customer.reservationTime || '',
            notes: reservation.notes,
        };
        const messageUrl = generateReservationWhatsAppMessage(details, reservation.orderNumber);
        window.open(messageUrl, '_blank');
        setConfirmedReservationData(null);
    };

    const handleSendMessageToChatbot = async (message: string) => {
        const userMessage: ChatMessage = { role: 'user', content: message };
        const newHistory = [...chatMessages, userMessage];
        setChatMessages(newHistory);
        setIsBotReplying(true);
        try {
            const reply = await firebaseService.askChatbot(
                newHistory,
                paintings,
                categories,
                isStoreOnline,
                siteSettings.operatingHours,
                userProfile,
                myOrders
            );
            setChatMessages(prev => [...prev, { role: 'bot', content: reply }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'bot', content: "Désolé, je rencontre un problème technique. Veuillez réessayer plus tard." }]);
        } finally {
            setIsBotReplying(false);
        }
    };

    const handleLogout = async () => {
        await auth?.signOut();
        setIsUserAreaModalOpen(false);
        addToast('Vous avez été déconnecté.', 'success');
    };
    
    return (
        <>
            <Header
                cartItemCount={cart.length}
                onCartClick={() => setIsCartOpen(true)}
                onOpenChatbot={() => setIsChatbotOpen(true)}
                activeSection={activeSection}
                settings={siteSettings}
                user={currentUser}
                onUserIconClick={() => currentUser ? setIsUserAreaModalOpen(true) : setIsLoginModalOpen(true)}
                isAuthLoading={isAuthLoading}
            />
            <main>
                <HeroSection settings={siteSettings} isLoading={isLoading} onReserveClick={() => setIsReservationModalOpen(true)} />
                <AboutSection settings={siteSettings} />
                <MenuSection
                    categories={categories}
                    paintings={paintings}
                    onAddToCart={handleAddToCart}
                    isStoreOnline={isStoreOnline}
                    activeCategoryId={activeMenuCategory}
                    setActiveCategoryId={setActiveMenuCategory}
                    cartItemCount={cart.length}
                    onCartClick={() => setIsCartOpen(true)}
                    cartItems={cart}
                />
                <ContactSection settings={siteSettings} />
                <AdminSection 
                    allProducts={paintings}
                    allCategories={categories}
                    isStoreOnline={isStoreOnline}
                    siteSettings={siteSettings}
                    orders={orders}
                    onSaveProduct={handleSaveProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onProductStatusChange={handleProductStatusChange}
                    onProductStockStatusChange={handleProductStockStatusChange}
                    onStoreStatusChange={handleStoreStatusChange}
                    onSaveCategory={handleSaveCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onCategoryStatusChange={handleCategoryStatusChange}
                    onReorderProducts={handleReorderProducts}
                    onReorderCategories={handleReorderCategories}
                    onSeedDatabase={handleSeedDatabase}
                    onSaveSiteSettings={handleSaveSiteSettings}
                    onUpdateSiteSettingsField={handleUpdateSiteSettingsField}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onUpdateOrderPaymentStatus={handleUpdateOrderPaymentStatus}
                    onUpdateOrderReservationTime={handleUpdateOrderReservationTime}
                    onDeleteOrder={async (id) => firebaseService.updateOrderStatus(id, 'deleted')}
                    onPermanentDeleteOrder={firebaseService.deleteOrder}
                    onPermanentDeleteMultipleOrders={firebaseService.permanentDeleteMultipleOrders}
                    onBulkDeleteProducts={firebaseService.bulkDeleteProducts}
                    onRestoreProduct={firebaseService.restoreProduct}
                    onPermanentDeleteProduct={firebaseService.permanentDeleteProduct}
                    onBulkPermanentDeleteProducts={firebaseService.bulkPermanentDeleteProducts}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                />
            </main>
            <Footer 
                settings={siteSettings} 
                onOpenChatbot={() => setIsChatbotOpen(true)}
                onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
                onUserAreaClick={() => currentUser ? setIsUserAreaModalOpen(true) : setIsLoginModalOpen(true)}
            />
             {toasts.map(toast => (
                <div key={toast.id} className={`fixed top-24 right-4 z-[9999] p-4 rounded-lg shadow-lg text-white animate-fade-in-up ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            ))}
            
            <CartSidebar 
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onUpdateQuantity={(itemId, newQuantity) => {
                    let newCart;
                    if (newQuantity <= 0) {
                        newCart = cart.filter(item => item.id !== itemId);
                    } else {
                        newCart = cart.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
                    }
                    setCart(newCart);
                    localStorage.setItem('artGalleryCart', JSON.stringify(newCart));
                }}
                onCheckout={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }}
                isStoreOnline={isStoreOnline}
                categories={categories}
                products={paintings}
                setActiveCategoryId={setActiveMenuCategory}
            />

            {isCheckoutModalOpen && (
                 <CheckoutModal 
                    isOpen={isCheckoutModalOpen}
                    onClose={() => setIsCheckoutModalOpen(false)}
                    cartItems={cart}
                    onConfirmCheckout={handleConfirmCheckout}
                    isProcessing={isProcessingOrder}
                    name={name}
                    setName={setName}
                    phone={phone}
                    setPhone={setPhone}
                    profile={userProfile}
                />
            )}
            
            {isReservationModalOpen && (
                <ReservationModal 
                    isOpen={isReservationModalOpen}
                    onClose={() => setIsReservationModalOpen(false)}
                    onConfirmReservation={handleConfirmReservation}
                    isProcessing={isProcessingOrder}
                    name={name}
                    phone={phone}
                />
            )}
            
            {confirmedOrderData && (
                <OrderConfirmationModal 
                    order={confirmedOrderData}
                    onClose={() => setConfirmedOrderData(null)}
                    onSendWhatsApp={handleSendWhatsApp}
                />
            )}
            
            {confirmedReservationData && (
                 <ReservationConfirmationModal
                    reservation={confirmedReservationData}
                    onClose={() => setConfirmedReservationData(null)}
                    onSendWhatsApp={handleSendReservationWhatsApp}
                />
            )}

            <Chatbot
                isOpen={isChatbotOpen}
                onClose={() => setIsChatbotOpen(false)}
                messages={chatMessages}
                onSendMessage={handleSendMessageToChatbot}
                isSending={isBotReplying}
                onCreateOrder={(details, cartItems) => {
                    console.log("Chatbot wants to create order:", details, cartItems);
                }}
                onCreateReservation={(details) => {
                     console.log("Chatbot wants to create reservation:", details);
                }}
                onShowPixQRCode={() => setIsPixQrCodeModalOpen(true)}
                userProfile={userProfile}
                myOrders={myOrders}
            />
            
            <LoginModal 
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onGoogleSignIn={() => { /* Logic here */ }}
                addToast={addToast}
                onRegisterSuccess={() => {
                    setIsLoginModalOpen(false);
                    setUserAreaInitialTab('addresses');
                    setUserAreaShowAddAddress(true);
                    setIsUserAreaModalOpen(true);
                    addToast('Bienvenue ! Veuillez ajouter une adresse pour commencer.', 'success');
                }}
                onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
                onOpenTermsOfService={() => setIsTermsModalOpen(true)}
                passwordResetCode={passwordResetCode}
            />

            {isUserAreaModalOpen && (
                <UserAreaModal 
                    isOpen={isUserAreaModalOpen}
                    onClose={() => setIsUserAreaModalOpen(false)}
                    user={currentUser}
                    profile={userProfile}
                    onLogout={handleLogout}
                    addToast={addToast}
                    initialTab={userAreaInitialTab}
                    showAddAddressForm={userAreaShowAddAddress}
                />
            )}
            
            {isPrivacyPolicyOpen && <PrivacyPolicyModal isOpen={isPrivacyPolicyOpen} onClose={() => setIsPrivacyPolicyOpen(false)} />}
            {isTermsModalOpen && <TermsOfServiceModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />}
            {showCookieBanner && <CookieConsentBanner onAccept={() => {
                localStorage.setItem('artGalleryCookieConsent', 'true');
                setShowCookieBanner(false);
            }} />}

            <HalfAndHalfModal 
                isOpen={isHalfAndHalfModalOpen}
                onClose={() => setIsHalfAndHalfModalOpen(false)}
                pizzas={paintings}
                firstHalf={null}
                onAddToCart={() => {}}
            />

            <PixQrCodeModal isOpen={isPixQrCodeModalOpen} onClose={() => setIsPixQrCodeModalOpen(false)} />
        </>
    );
};

export default App;
