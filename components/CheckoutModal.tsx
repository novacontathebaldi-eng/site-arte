import React, { useState, useEffect } from 'react';
import { CartItem, OrderDetails, Order, UserProfile, Address } from '../types';
import { PixQrCodeModal } from './PixQrCodeModal';

interface OrderConfirmationModalProps {
    order: Order | null;
    onClose: () => void;
    onSendWhatsApp: (order: Order) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ order, onClose, onSendWhatsApp }) => {
    if (!order) return null;

    const isPaidOnline = order.paymentStatus === 'paid' || order.paymentStatus === 'paid_online';
    const title = isPaidOnline ? "Paiement Approuvé !" : "Commande Enregistrée !";
    const titleIcon = isPaidOnline ? "fa-check-circle text-green-500" : "fa-receipt text-green-500";
    const totalLabel = isPaidOnline ? "Total Payé :" : "Total de la Commande :";

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in-up">
                    <div className="flex justify-between items-center p-5 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                            <i className={`fas ${titleIcon}`}></i>
                            {title}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                    </div>
                    <div className="overflow-y-auto p-6 text-center space-y-4">
                        <p className="text-gray-600 text-base">
                            Votre commande a été enregistrée ! Pour la finaliser, vous devez l'envoyer via WhatsApp.
                        </p>
                        
                        <div className="text-left bg-gray-50 p-4 rounded-lg border text-gray-800 space-y-2 text-sm">
                            <p><strong><i className="fas fa-receipt fa-fw mr-2 text-gray-400"></i>Commande :</strong> #{order.orderNumber}</p>
                            <p><strong><i className="fas fa-user fa-fw mr-2 text-gray-400"></i>Nom :</strong> {order.customer.name}</p>
                            {order.total != null && (
                                <p><strong><i className="fas fa-euro-sign fa-fw mr-2 text-gray-400"></i>{totalLabel}</strong> {order.total.toLocaleString('fr-LU', { style: 'currency', currency: 'EUR' })}</p>
                            )}
                        </div>

                        <p className="text-gray-600 text-sm px-2">
                           Merci de votre préférence !
                        </p>

                        <button
                            onClick={() => onSendWhatsApp(order)}
                            className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-600 transition-all flex items-center justify-center min-h-[52px]"
                        >
                            <i className="fab fa-whatsapp mr-2"></i> Envoyer via WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};


interface ReservationConfirmationModalProps {
    reservation: Order | null;
    onClose: () => void;
    onSendWhatsApp: (reservation: Order) => void;
}

const formatDateForDisplay = (dateString?: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    }).format(date);
};

export const ReservationConfirmationModal: React.FC<ReservationConfirmationModalProps> = ({ reservation, onClose, onSendWhatsApp }) => {
    if (!reservation) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in-up">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                        <i className="fas fa-calendar-check text-green-500"></i>
                        Visite demandée !
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 text-center space-y-4">
                    <p className="text-gray-600 text-base">
                        Votre demande de visite a été envoyée ! Je vous contacterai bientôt par WhatsApp pour confirmer les détails.
                    </p>
                    
                    <div className="text-left bg-gray-50 p-4 rounded-lg border text-gray-800 space-y-2 text-sm">
                        <p><strong><i className="fas fa-receipt fa-fw mr-2 text-gray-400"></i>Demande :</strong> #{reservation.orderNumber}</p>
                        <p><strong><i className="fas fa-user fa-fw mr-2 text-gray-400"></i>Nom :</strong> {reservation.customer.name}</p>
                        {reservation.customer.reservationDate && (
                            <p className="capitalize"><strong><i className="fas fa-calendar-alt fa-fw mr-2 text-gray-400"></i>Date :</strong> {formatDateForDisplay(reservation.customer.reservationDate)}</p>
                        )}
                        {reservation.customer.reservationTime && (
                            <p><strong><i className="fas fa-clock fa-fw mr-2 text-gray-400"></i>Heure :</strong> {reservation.customer.reservationTime}</p>
                        )}
                        {reservation.numberOfPeople != null && (
                            <p><strong><i className="fas fa-users fa-fw mr-2 text-gray-400"></i>Personnes :</strong> {reservation.numberOfPeople}</p>
                        )}
                    </div>
                    <button
                        onClick={() => onSendWhatsApp(reservation)}
                        className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-600 transition-all flex items-center justify-center min-h-[52px]"
                    >
                        <i className="fab fa-whatsapp mr-2"></i> Envoyer via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};


const DELIVERY_FEE = 15.00; // Example delivery fee for Luxembourg

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onConfirmCheckout: (details: OrderDetails) => void;
    isProcessing: boolean;
    name: string;
    setName: (name: string) => void;
    phone: string;
    setPhone: (phone: string) => void;
    profile: UserProfile | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cartItems, onConfirmCheckout, isProcessing, name, setName, phone, setPhone, profile }) => {
    const deliverableAddresses = profile?.addresses?.filter(a => a.isDeliveryArea) || [];
    const favoriteAddress = deliverableAddresses.find(a => a.isFavorite);

    const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'local' | ''>('');
    
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [complement, setComplement] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash' | ''>('');
    const [notes, setNotes] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState<string>(favoriteAddress ? favoriteAddress.id : 'manual');

    useEffect(() => {
        if (isOpen) {
            const fav = profile?.addresses?.filter(a => a.isDeliveryArea).find(a => a.isFavorite);
            setSelectedAddressId(fav ? fav.id : 'manual');
        } else {
            setOrderType(''); setStreet(''); setNumber(''); setCity(''); setPostalCode(''); setComplement(''); setPaymentMethod(''); setNotes('');
            setSelectedAddressId(favoriteAddress ? favoriteAddress.id : 'manual');
        }
    }, [isOpen, profile, favoriteAddress]);

    useEffect(() => {
        if (selectedAddressId === 'manual') {
             setStreet(''); setNumber(''); setCity(''); setPostalCode(''); setComplement('');
        } else {
            const selectedAddr = deliverableAddresses.find(a => a.id === selectedAddressId);
            if (selectedAddr) {
                setStreet(selectedAddr.street);
                setNumber(selectedAddr.number);
                setCity(selectedAddr.city);
                setPostalCode(selectedAddr.cep);
                setComplement(selectedAddr.complement || '');
            }
        }
    }, [selectedAddressId, deliverableAddresses]);

    if (!isOpen) return null;

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee;
    const formatPrice = (p: number) => p.toLocaleString('fr-LU', { style: 'currency', currency: 'EUR' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const details: OrderDetails = {
            name, phone, orderType: orderType as 'delivery' | 'pickup' | 'local',
            street, number, city, neighborhood: postalCode, // Using neighborhood for postal code
            complement, paymentMethod: paymentMethod as 'credit' | 'debit' | 'pix' | 'cash',
            notes, deliveryFee
        };
        onConfirmCheckout(details);
    };
    
    const isAddressLocked = selectedAddressId !== 'manual';

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-5 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-text-primary"><i className="fas fa-clipboard-check mr-2"></i>Finaliser la Commande</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                    </div>
                    <div className="overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Nom complet *</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100" required disabled={!!profile} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Téléphone *</label>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Type de commande *</label>
                                <select value={orderType} onChange={e => setOrderType(e.target.value as any)} className="w-full px-3 py-2 border rounded-md bg-white" required>
                                    <option value="" disabled>Sélectionnez...</option>
                                    <option value="delivery">Livraison</option>
                                    <option value="pickup">Retrait en galerie</option>
                                </select>
                            </div>

                            {orderType === 'delivery' && (
                                <div className="p-4 bg-gray-50 rounded-md border animate-fade-in-up space-y-4">
                                    <div className="text-center bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold p-2 rounded-md">
                                        <i className="fas fa-truck mr-2"></i>Frais de livraison : {formatPrice(DELIVERY_FEE)}
                                    </div>
                                    {profile && deliverableAddresses.length > 0 && (
                                         <div>
                                            <label className="block text-sm font-semibold mb-1">Adresse de livraison</label>
                                            <select value={selectedAddressId} onChange={e => setSelectedAddressId(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                                                <option value="manual">Saisir une nouvelle adresse</option>
                                                {deliverableAddresses.map(addr => (
                                                    <option key={addr.id} value={addr.id}>{addr.label} ({addr.street}, {addr.number})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold mb-1">Rue et numéro *</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <input type="text" value={street} onChange={e => setStreet(e.target.value)} className="col-span-2 w-full px-3 py-2 border rounded-md disabled:bg-gray-100" required disabled={isAddressLocked} placeholder="Nom de la rue"/>
                                                <input type="text" value={number} onChange={e => setNumber(e.target.value)} className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100" required disabled={isAddressLocked} placeholder="N°"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Code Postal *</label>
                                            <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100" required disabled={isAddressLocked} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Ville *</label>
                                            <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100" required disabled={isAddressLocked} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Complément (optionnel)</label>
                                        <input type="text" value={complement} onChange={e => setComplement(e.target.value)} className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100" placeholder="Étage, appartement, etc." disabled={isAddressLocked} />
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-semibold mb-1">Méthode de paiement *</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full px-3 py-2 border rounded-md bg-white" required>
                                    <option value="" disabled>Sélectionnez...</option>
                                    <option value="credit">Carte de crédit</option>
                                    <option value="debit">Carte de débit</option>
                                    <option value="pix">Virement bancaire</option>
                                </select>
                            </div>
                            
                             <div>
                                <label className="block text-sm font-semibold mb-1">Notes (optionnel)</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={2} placeholder="Instructions spéciales pour la livraison..." />
                            </div>
                            <div className="p-4 bg-brand-ivory-50 rounded-lg my-4">
                                <h3 className="font-bold mb-2">Résumé de la commande</h3>
                                <div className="space-y-1">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.name} ({item.dimensions})</span>
                                            <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                {deliveryFee > 0 && (
                                    <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                                        <span>Frais de livraison:</span>
                                        <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                                    <span>Total:</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>
                             <button 
                                type="submit" 
                                disabled={isProcessing}
                                className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg text-lg hover:opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-h-[52px]"
                            >
                                {isProcessing ? (
                                    <><i className="fas fa-spinner fa-spin mr-2"></i> Envoi...</>
                                ) : (
                                    <><i className="fas fa-check-circle mr-2"></i> Envoyer la commande</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
