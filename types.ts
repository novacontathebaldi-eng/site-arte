import firebase from 'firebase/compat/app';

// FIX: Added 'bairro', 'localidade', 'state', 'isDeliveryArea' and replaced 'postalCode' with 'cep'.
export interface Address {
    id: string;
    label: string; // e.g., 'Maison', 'Bureau'
    street: string;
    number: string;
    complement?: string;
    city: string;
    cep: string;
    bairro: string;
    localidade: string;
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
    // For half-and-half pizza feature (legacy but keeps types consistent)
    isHalfAndHalf?: boolean;
    secondHalf?: {
        productId: string;
        name: string;
    };
}

// FIX: Added 'local' to orderType and new optional fields for delivery and payment.
export interface OrderDetails {
    name: string;
    phone: string;
    orderType: 'delivery' | 'pickup' | 'local';
    // Shipping details
    street?: string;
    number?: string;
    complement?: string;
    city?: string;
    neighborhood?: string;
    // Payment
    paymentMethod: 'credit' | 'debit' | 'pix' | 'cash';
    notes: string;
    deliveryFee?: number;
    changeNeeded?: boolean;
    changeAmount?: string;
}

// FIX: Updated OrderStatus to reflect the pizza restaurant workflow.
export type OrderStatus = 'pending' | 'accepted' | 'reserved' | 'ready' | 'completed' | 'cancelled' | 'deleted' | 'awaiting-payment';
// FIX: Added 'paid_online' to support online payments.
export type PaymentStatus = 'pending' | 'paid' | 'paid_online' | 'refunded';

// FIX: Added 'local' to orderType and new fields for address and reservation details.
export interface OrderCustomerDetails {
    name: string;
    phone: string;
    orderType: 'delivery' | 'pickup' | 'local';
    // Address details
    street?: string;
    number?: string;
    complement?: string;
    city?: string;
    neighborhood?: string;
    address?: string; // For backward compatibility / flexibility
    // Reservation details
    reservationDate?: string;
    reservationTime?: string;
}

// FIX: Updated Order type with several missing properties and made some optional for reservations.
export interface Order {
    id: string;
    userId?: string;
    orderNumber: number;
    customer: OrderCustomerDetails;
    // FIX: Changed type to include `id` to fix key errors in UI lists.
    items?: (Omit<CartItem, 'imageUrl'>)[];
    total?: number;
    deliveryFee?: number;
    paymentMethod?: 'credit' | 'debit' | 'pix' | 'cash';
    notes?: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: firebase.firestore.Timestamp | any;
    
    // Missing properties
    pickupTimeEstimate?: string;
    changeNeeded?: boolean;
    changeAmount?: string;
    numberOfPeople?: number;
    allergies?: string;
    mercadoPagoDetails?: {
        qrCodeBase64: string;
        qrCode: string;
    };
}

export interface DaySchedule {
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
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

// Deprecated, but kept to prevent type errors in unused components
export interface ReservationDetails {
    name: string;
    phone: string;
    numberOfPeople: number;
    reservationDate: string;
    reservationTime: string;
    notes?: string;
}
