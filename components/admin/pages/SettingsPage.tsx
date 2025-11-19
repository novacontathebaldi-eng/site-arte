import React, { useState } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { seedDatabase } from '../../../lib/seed';
import { useToast } from '../../../hooks/useToast';


const SettingsPage: React.FC = () => {
    const { addToast } = useToast();
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        if (window.confirm("Are you sure you want to seed the database? This will add sample products and may create duplicates if run multiple times.")) {
            setIsSeeding(true);
            try {
                await seedDatabase();
                addToast("Database seeded successfully!", "success");
            } catch (error: any) {
                addToast(`Seeding failed: ${error.message}`, "error");
            } finally {
                setIsSeeding(false);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-brand-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold font-serif mb-4">General Settings</h2>
                <div className="space-y-4">
                    <Input id="site-title" label="Site Title" defaultValue="Meeh - Art by Melissa Pelussi" />
                    <Input id="contact-email" label="Contact Email" type="email" defaultValue="hello@meeh.lu" />
                    <div>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded"/>
                            <span>Enable Maintenance Mode</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-brand-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-bold font-serif mb-4">Discount Codes</h2>
                 <p className="text-sm text-brand-black/70">Discount code management UI would be here.</p>
            </div>

            <div className="bg-brand-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold font-serif mb-4">Database Actions</h2>
                <p className="text-sm text-brand-black/70 mb-4">Use with caution. This is for development purposes.</p>
                <Button onClick={handleSeed} disabled={isSeeding} variant="secondary">
                    {isSeeding ? 'Seeding...' : 'Seed Sample Products'}
                </Button>
            </div>
            
            <div className="flex justify-end">
                <Button>Save Settings</Button>
            </div>
        </div>
    );
};

export default SettingsPage;
