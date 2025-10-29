import React from 'react';
import { SiteSettings, DaySchedule } from '../types';

interface ContactSectionProps {
    settings: SiteSettings;
}

function formatOperatingHoursGroups(operatingHours?: DaySchedule[]): { days: string, time: string }[] {
    if (!operatingHours?.length) return [];
    
    const openSchedules = operatingHours.filter(h => h.isOpen);
    if (openSchedules.length === 0) return [];
    
    const schedulesByTime = openSchedules.reduce((acc, schedule) => {
        const timeKey = `${schedule.openTime}-${schedule.closeTime}`;
        if (!acc[timeKey]) acc[timeKey] = [];
        acc[timeKey].push(schedule);
        return acc;
    }, {} as Record<string, DaySchedule[]>);

    const result: { days: string, time: string }[] = [];

    for (const timeKey in schedulesByTime) {
        const schedules = schedulesByTime[timeKey].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        if (schedules.length === 0) continue;

        let dayString;
        if (schedules.length === 7) {
            dayString = 'Tous les jours';
        } else {
            const sequences: DaySchedule[][] = [];
            if (schedules.length > 0) {
                let currentSequence: DaySchedule[] = [schedules[0]];
                for (let i = 1; i < schedules.length; i++) {
                    if (schedules[i].dayOfWeek === schedules[i - 1].dayOfWeek + 1) {
                        currentSequence.push(schedules[i]);
                    } else {
                        sequences.push(currentSequence);
                        currentSequence = [schedules[i]];
                    }
                }
                sequences.push(currentSequence);
            }

            const formattedSequences = sequences.map(seq => {
                if (seq.length === 1) return seq[0].dayName;
                if (seq.length === 2) return `${seq[0].dayName} et ${seq[1].dayName}`;
                return `De ${seq[0].dayName} à ${seq[seq.length - 1].dayName}`;
            });
            dayString = formattedSequences.join(' et ');
        }

        const [openTime, closeTime] = timeKey.split('-');
        result.push({
            days: dayString,
            time: `de ${openTime}h à ${closeTime}h`
        });
    }
    return result;
}

const formatOperatingHours = (operatingHours?: DaySchedule[]): string => {
    if (!operatingHours?.length) {
        return 'Horaires non communiqués.';
    }
    const openSchedules = operatingHours.filter(h => h.isOpen);
    if (openSchedules.length === 0) {
        return 'Fermé tous les jours.';
    }
    const groups = formatOperatingHoursGroups(operatingHours);
    if (groups.length === 0) {
        return 'Fermé tous les jours.';
    }
    return groups.map(group => `${group.days}, ${group.time}`).join(' | ');
};


export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
    const address = "19 Rue de la Reine, L-2418 Luxembourg";
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    const facadeImageUrl = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800";
    const operatingHoursText = formatOperatingHours(settings.operatingHours);


    return (
        <section id="contato" className="py-20 bg-white">
             <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                     <span className="inline-block bg-brand-accent/10 text-brand-secondary px-4 py-2 rounded-full font-semibold text-sm mb-4">
                        <i className="fas fa-map-marked-alt mr-2"></i>Venez nous rendre visite
                    </span>
                    <h2 className="text-4xl font-serif font-bold text-text-primary">Notre Galerie</h2>
                    <p className="text-lg text-text-secondary mt-2 max-w-2xl mx-auto">Situés au cœur de Luxembourg, nous sommes prêts à vous accueillir.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-stretch bg-brand-background p-6 sm:p-8 rounded-2xl shadow-lg border border-brand-accent/20">
                    <div className="flex flex-col space-y-6">
                        <img 
                            src={facadeImageUrl}
                            alt="Galerie d'art" 
                            className="rounded-xl shadow-lg w-full h-64 object-cover" 
                        />
                        <div className="space-y-4 flex-grow">
                            <div className="flex items-start gap-4">
                                <i className="fas fa-map-marker-alt text-brand-secondary text-xl mt-1 w-6 text-center flex-shrink-0"></i>
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">Notre Adresse</h3>
                                    <p className="text-text-secondary">{address}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <i className="fas fa-clock text-brand-secondary text-xl mt-1 w-6 text-center flex-shrink-0"></i>
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">Horaires d'ouverture</h3>
                                    <p className="text-text-secondary">{operatingHoursText}</p>
                                </div>
                            </div>
                        </div>
                        <a 
                            href={googleMapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-auto block text-center bg-brand-primary text-white font-bold py-3 px-6 rounded-lg text-lg hover:opacity-90 transition-all transform hover:scale-105"
                        >
                            <i className="fas fa-directions mr-2"></i>
                            Itinéraire
                        </a>
                    </div>
                    <div className="w-full h-full min-h-[400px] lg:min-h-full rounded-xl overflow-hidden shadow-lg">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2588.58625902047!2d6.128038315700207!3d49.61066997936846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4795491a54779f6b%3A0x7052a5147883a48e!2s19%20Rue%20de%20la%20Reine%2C%202418%20Luxembourg!5e0!3m2!1sfr!2slu!4v1627832811555!5m2!1sfr!2slu"
                            className="w-full h-full"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Emplacement de la galerie d'art"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};
