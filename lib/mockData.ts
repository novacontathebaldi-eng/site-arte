import { Order, AddressWithId, Wishlist } from '../types';

// Este arquivo simula seu banco de dados (Firestore).
// Criamos uma lista de produtos de exemplo com todos os detalhes, incluindo as traduções.
// Usamos isso para desenvolver e testar a aparência do site sem precisar conectar
// ao Firebase o tempo todo. As imagens são placeholders do serviço picsum.photos.

// MOCK PRODUCTS REMOVED - NOW FETCHING FROM SUPABASE

export const mockOrders: Order[] = [
    {
        id: '1',
        orderNumber: '#1001',
        userId: 'mock-user-id',
        status: 'delivered',
        items: [
            {
                productId: '1',
                productSnapshot: { title: 'Ethereal Reverie', image: 'https://picsum.photos/id/101/800/800', price: 1200 },
                quantity: 1,
                price: 1200,
                subtotal: 1200
            }
        ],
        pricing: { subtotal: 1200, shipping: 25, discount: 0, tax: 245, total: 1470 },
        shippingAddress: {
            recipientName: 'John Doe',
            addressLine1: '123 Art Street',
            city: 'Luxembourg',
            postalCode: 'L-1234',
            country: 'Luxembourg',
            phone: '+352 123 456 789',
            isDefault: true,
        },
        paymentMethod: { type: 'card', last4: '4242', brand: 'Visa' },
        paymentStatus: 'paid',
        statusHistory: [
            { status: 'pending', timestamp: '2024-05-10T10:00:00Z' },
            { status: 'confirmed', timestamp: '2024-05-10T10:05:00Z' },
            { status: 'preparing', timestamp: '2024-05-11T14:00:00Z' },
            { status: 'shipped', timestamp: '2024-05-12T09:00:00Z' },
            { status: 'delivered', timestamp: '2024-05-14T11:30:00Z' }
        ],
        createdAt: '2024-05-10T10:00:00Z',
        updatedAt: '2024-05-14T11:30:00Z',
    },
    {
        id: '2',
        orderNumber: '#1002',
        userId: 'mock-user-id',
        status: 'shipped',
        items: [
            {
                productId: '2',
                productSnapshot: { title: 'Moon-drop Pendant', image: 'https://picsum.photos/id/201/800/800', price: 350 },
                quantity: 1,
                price: 350,
                subtotal: 350
            },
            {
                productId: '6',
                productSnapshot: { title: "'Echo' Print", image: 'https://picsum.photos/id/604/800/800', price: 250 },
                quantity: 2,
                price: 250,
                subtotal: 500
            }
        ],
        pricing: { subtotal: 850, shipping: 15, discount: 50, tax: 160, total: 975 },
        shippingAddress: {
            recipientName: 'Jane Smith',
            addressLine1: '456 Culture Avenue',
            city: 'Paris',
            postalCode: '75001',
            country: 'France',
            phone: '+33 1 23 45 67 89',
            isDefault: false,
        },
        paymentMethod: { type: 'paypal' },
        paymentStatus: 'paid',
        statusHistory: [
            { status: 'pending', timestamp: '2024-06-20T18:30:00Z' },
            { status: 'confirmed', timestamp: '2024-06-20T18:32:00Z' },
            { status: 'preparing', timestamp: '2024-06-21T10:00:00Z' },
            { status: 'shipped', timestamp: '2024-06-21T16:45:00Z' }
        ],
        createdAt: '2024-06-20T18:30:00Z',
        updatedAt: '2024-06-21T16:45:00Z',
    }
];

export let mockAddresses: AddressWithId[] = [
    {
        id: 'addr-1',
        recipientName: 'John Doe',
        addressLine1: '123 Art Street',
        city: 'Luxembourg',
        postalCode: 'L-1234',
        country: 'Luxembourg',
        phone: '+352 123 456 789',
        isDefault: true,
    },
    {
        id: 'addr-2',
        recipientName: 'John Doe',
        company: 'Art Enthusiasts Inc.',
        addressLine1: '456 Culture Avenue',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        phone: '+33 1 23 45 67 89',
        isDefault: false,
    },
];

export let mockWishlist: Wishlist = {
    userId: 'mock-user-id',
    items: [
        { productId: '5', addedAt: '2024-06-15T10:00:00Z' },
        { productId: '7', addedAt: '2024-06-18T14:30:00Z' },
    ]
};