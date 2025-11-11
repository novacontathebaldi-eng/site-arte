import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex flex-col">
        <label htmlFor={id} className="font-medium text-text-primary cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          name={id}
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
        />
        <label
          htmlFor={id}
          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
            checked ? 'bg-secondary' : 'bg-gray-300'
          }`}
        ></label>
      </div>
       <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #D4AF37;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #D4AF37;
        }
      `}</style>
    </div>
  );
};

export default ToggleSwitch;