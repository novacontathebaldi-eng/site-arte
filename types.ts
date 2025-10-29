import firebase from 'firebase/compat/app';

export interface Address {
    id: string;
    label: string; // e.g., 'Maison', 'Bureau'
    street: string;
    number: string;
    complement?: string;
    city: string;
    cep: string;
    bairro: string; // Could be district or area
    localidade: string; // Could be locality or neighborhood
    state: string;
    isFavorite?: boolean;
    isDeliveryArea?: boolean;
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    photoURL: string;
    phone?: string;
    addresses?: Address[];
}

export interface Painting {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    price: number;
    dimensions: string; // e.g., "80x60cm"
    technique: string; // e.g., "Acrylique sur toile"
    year: number;
    imageUrl: string;
    badge?: string;
    active: boolean;
    orderIndex: number;
    stockStatus?: 'available' | 'out_of_stock';
    deleted?: boolean;
    isPromotion?: boolean;
    promotionalPrice?: number;
}

export interface Category {
    id: string;
    name: string;
    order: number;
    active: boolean;
}

export interface CartItem {
    id: string;
    paintingId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    dimensions: string;
    isHalfAndHalf?: boolean; // Legacy
    secondHalf?: { // Legacy
        productId: string;
        name: string;
    };
}

export interface OrderDetails {
    name: string;
    phone: string;
    orderType: 'delivery' | 'pickup' | 'local';
    street?: string;
    number?: string;
    complement?: string;
    city?: string;
    neighborhood?: string; // Generic term for area/district
    paymentMethod: 'credit' | 'debit' | 'pix' | 'cash';
    notes: string;
    deliveryFee?: number;
    changeNeeded?: boolean;
    changeAmount?: string;
}

// FIX: Updated OrderStatus to include legacy and new statuses to resolve type errors and support the full order lifecycle for art sales.
export type OrderStatus = 'pending' | 'awaiting-payment' | 'processing' | 'ready' | 'shipped' | 'completed' | 'cancelled' | 'deleted' | 'reserved';
export type PaymentStatus = 'pending' | 'paid' | 'paid_online' | 'refunded';

export interface OrderCustomerDetails {
    name: string;
    phone: string;
    orderType: 'delivery' | 'pickup' | 'local';
    street?: string;
    number?: string;
    complement?: string;
    city?: string;
    neighborhood?: string;
    address?: string; 
    reservationDate?: string;
    reservationTime?: string;
}

export interface Order {
    id: string;
    userId?: string;
    orderNumber: number;
    customer: OrderCustomerDetails;
    items?: (Omit<CartItem, 'imageUrl'>)[];
    total?: number;
    deliveryFee?: number;
    paymentMethod?: 'credit' | 'debit' | 'pix' | 'cash';
    notes?: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: firebase.firestore.Timestamp | any;
    pickupTimeEstimate?: string; // Legacy, can be repurposed for shipping estimate
    changeNeeded?: boolean;
    changeAmount?: string;
    numberOfPeople?: number; // For reservations/visits
    allergies?: string; // Legacy
    mercadoPagoDetails?: {
        qrCodeBase64: string;
        qrCode: string;
    };
}

export interface DaySchedule {
    dayOfWeek: number;
    dayName: string;
    isOpen: boolean;
    openTime: string; // HH:mm
    closeTime: string; // HH:mm
}

export interface ContentSectionListItem {
    id: string;
    icon: string;
    text: string;
}

export interface ContentSection {
    id: string;
    order: number;
    isVisible: boolean;
    imageUrl: string;
    isTagVisible?: boolean;
    tagIcon?: string;
    tag: string;
    title: string;
    description: string;
    list: ContentSectionListItem[];
}

export interface FooterLink {
    id: string;
    icon: string;
    text: string;
    url: string;
    isVisible?: boolean;
}

export interface SiteSettings {
    logoUrl: string;
    heroSlogan: string;
    heroTitle: string;
    heroSubtitle: string;
    heroBgUrl: string;
    contentSections: ContentSection[];
    footerLinks: FooterLink[];
    automaticSchedulingEnabled?: boolean;
    operatingHours?: DaySchedule[];
}

export interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
}

export interface ReservationDetails {
    name: string;
    phone: string;
    numberOfPeople: number;
    reservationDate: string;
    reservationTime: string;
    notes?: string;
}