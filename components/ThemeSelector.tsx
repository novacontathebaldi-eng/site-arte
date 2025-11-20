import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeSetting } from '../contexts/ThemeContext';

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SystemIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ThemeSelector: React.FC = () => {
  const { themeSetting, setThemeSetting } = useTheme();

  const options: { value: ThemeSetting; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <SunIcon className="w-5 h-5" />, label: 'Light' },
    { value: 'dark', icon: <MoonIcon className="w-5 h-5" />, label: 'Dark' },
    { value: 'system', icon: <SystemIcon className="w-5 h-5" />, label: 'System' },
  ];

  return (
    <div className="flex items-center space-x-1 p-1 bg-black/5 dark:bg-white/10 rounded-md">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setThemeSetting(opt.value)}
          className={`flex items-center justify-center w-9 h-8 rounded-md transition-colors
            ${themeSetting === opt.value
              ? 'bg-brand-white dark:bg-gray-700 ring-1 ring-black/10 dark:ring-white/10 shadow-sm'
              : 'hover:bg-black/5 dark:hover:bg-white/10 text-brand-black/60 dark:text-brand-white/60'
            }`}
          aria-label={`Switch to ${opt.label} theme`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
