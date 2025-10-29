import React from 'react';
import { SiteSettings, DaySchedule } from '../types';

interface FooterProps {
    settings: SiteSettings;
    onOpenChatbot: () => void;
    onOpenPrivacyPolicy: () => void;
    onUserAreaClick: () => void;
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

const formatOperatingHours = (operatingHours?: DaySchedule[]): string[] => {
    if (!operatingHours?.length) {
        return ['Horaires non informés.'];
    }
    const openSchedules = operatingHours.filter(h => h.isOpen);
    if (openSchedules.length === 0) {
        return ['Fermé tous les jours.'];
    }
    const groups = formatOperatingHoursGroups(operatingHours);
    if (groups.length === 0) {
        return ['Fermé tous les jours.'];
    }
    return groups.map(group => `${group.days}: ${group.time}`);
};

export const Footer: React.FC<FooterProps> = ({ settings, onOpenChatbot, onOpenPrivacyPolicy, onUserAreaClick }) => {
    const visibleLinks = settings.footerLinks?.filter(link => link.isVisible !== false) ?? [];
    const socialLinks = visibleLinks.filter(link => link.icon.startsWith('fab'));
    const otherLinks = visibleLinks.filter(link => !link.icon.startsWith('fab') && link.url !== '#admin');
    const operatingHoursParts = formatOperatingHours(settings.operatingHours);

    return (
        <footer id="footer-section" className="bg-brand-primary text-text-on-dark pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start md:col-span-1">
                        <div className="flex items-center gap-3 text-2xl font-serif font-bold mb-4">
                           <img src={settings.logoUrl} alt="Logo" className="h-12" />
                            <span>Andressa Pelussi</span>
                        </div>
                        <p className="text-brand-accent mb-4">{settings.heroSlogan}</p>
                        <div className="flex gap-4">
                            {socialLinks.map(link => {
                                let bgColor = 'bg-gray-500';
                                if (link.icon.includes('instagram')) bgColor = 'bg-pink-600 hover:bg-pink-500';

                                return (
                                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-xl transition-colors`}>
                                        <i className={link.icon}></i>
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Contact</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li><i className="fas fa-map-marker-alt mr-2 text-brand-secondary"></i>Luxembourg</li>
                            <li><i className="fas fa-phone mr-2 text-brand-secondary"></i>(+352) 12 345 678</li>
                            <li><i className="fas fa-envelope mr-2 text-brand-secondary"></i>contact@example.com</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Horaires d'ouverture</h4>
                         <ul className="space-y-2 text-gray-300">
                            {operatingHoursParts.map((part, index) => (
                                <li key={index}>{part}</li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-bold text-lg mb-4">Navigation</h4>
                         <ul className="space-y-2 text-gray-300">
                            {otherLinks.map(link => (
                                <li key={link.id}>
                                    <a href={link.url} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                                        <span>{link.text}</span>
                                    </a>
                                </li>
                            ))}
                            <li>
                                <button onClick={onUserAreaClick} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                                    <span>Espace Client</span>
                                </button>
                            </li>
                            <li>
                                <button onClick={onOpenChatbot} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                                    <span>Aide et Support</span>
                                </button>
                            </li>
                            <li>
                                <button onClick={onOpenPrivacyPolicy} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                                    <span>Politique de Confidentialité</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-brand-olive-600 mt-8 pt-6 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Andressa Pelussi. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};
