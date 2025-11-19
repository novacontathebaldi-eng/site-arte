import React from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';

const SettingsPage: React.FC = () => {
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
            
            <div className="flex justify-end">
                <Button>Save Settings</Button>
            </div>
        </div>
    );
};

export default SettingsPage;
