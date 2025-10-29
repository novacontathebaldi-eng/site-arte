import React from 'react';
import { Painting } from '../types';

interface HalfAndHalfModalProps {
    isOpen: boolean;
    onClose: () => void;
    pizzas: Painting[]; // Although named pizzas, it will receive Paintings
    firstHalf: Painting | null;
    onAddToCart: (product1: Painting, product2: Painting, size: string) => void;
}

// This component is no longer used in the Art Gallery theme.
// It's kept as a placeholder to prevent import errors in App.tsx.
export const HalfAndHalfModal: React.FC<HalfAndHalfModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white p-8 rounded-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Fonctionnalité non applicable</h2>
                <button onClick={onClose} className="mt-4 bg-gray-200 px-4 py-2 rounded">Fermer</button>
            </div>
        </div>
    );
};
