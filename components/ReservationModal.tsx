import React, { useState, useEffect } from 'react';
import { ReservationDetails } from '../types';

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmReservation: (details: ReservationDetails) => void;
    isProcessing: boolean;
    name: string;
    phone: string;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ 
    isOpen, onClose, onConfirmReservation, isProcessing, name, phone 
}) => {
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form when opening
            const today = new Date();
            today.setDate(today.getDate() + 1); // Default to tomorrow
            setReservationDate(today.toISOString().split('T')[0]);
            setReservationTime('14:00');
            setNumberOfPeople(1);
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirmReservation({
            name,
            phone,
            numberOfPeople,
            reservationDate,
            reservationTime,
            notes
        });
    };
    
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-text-primary"><i className="fas fa-calendar-check mr-2"></i>Prendre rendez-vous</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-gray-600">Planifiez une visite privée à l'atelier pour voir les œuvres en personne. Je vous contacterai pour confirmer la disponibilité.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-semibold mb-1">Nombre de personnes *</label>
                                <input type="number" min="1" max="10" value={numberOfPeople} onChange={e => setNumberOfPeople(parseInt(e.target.value, 10))} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Date *</label>
                                <input type="date" value={reservationDate} onChange={e => setReservationDate(e.target.value)} min={getMinDate()} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Heure *</label>
                                <input type="time" value={reservationTime} onChange={e => setReservationTime(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold mb-1">Notes (optionnel)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3} placeholder="Avez-vous une œuvre spécifique en tête ?" />
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
                            <button type="submit" disabled={isProcessing} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 flex items-center justify-center min-w-[180px]">
                                {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane mr-2"></i><span>Envoyer la demande</span></>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
