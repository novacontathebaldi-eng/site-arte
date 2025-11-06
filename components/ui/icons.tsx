import React from 'react';

export const ShoppingBagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
  </svg>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
    </svg>
);

export const MinusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path>
    </svg>
);

export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.272 36.318 48 30.656 48 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

// Ícones para o Dashboard
export const OverviewIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
);
export const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
);
export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
);
export const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
export const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
);
export const HeartSolidIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
);
export const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);

// Ícones para as abas de Configurações
export const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
);
export const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
);
export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 3 9-3a12.02 12.02 0 00-3.382-11.957z"></path></svg>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
);

export const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const EuroIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 15.536c-1.171 1.171-3.07 1.171-4.242 0-1.172-1.171-1.172-3.07 0-4.242 1.171-1.171 3.07-1.171 4.242 0M12 6v2m0 8v2m-6-6h2m8 0h2"></path></svg>
);

export const TruckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);


// Ícones de Pagamento
export const VisaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48" {...props}>
        <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"></path><path fill="#FFF" d="M15.186,13l-4.215,16h2.893l4.215-16H15.186z M28.785,13l-4.215,16h2.893l4.215-16H28.785z M39,29h2.809l-2.065-16H36.8L39,29z M21.785,29h2.893l-4.215-16h-2.893L21.785,29z M11.141,29h2.893l-4.215-16H6.926L11.141,29z M32,13h-2.215l-4.215,16h2.893L32,13z"></path><path fill="#FFC107" d="M12.162,29h2.893l-2.618-11.777c-0.089-0.401-0.453-0.686-0.876-0.686H9.034c-0.384,0-0.72,0.245-0.848,0.599L5.352,29h2.893l1.584-7.125c0.051-0.228,0.258-0.396,0.493-0.396h1.277c0.235,0,0.442,0.168,0.493,0.396L12.162,29z"></path>
    </svg>
);

export const MastercardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48" {...props}>
        <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"></path><circle cx="24" cy="24" r="7" fill="#EB001B"></circle><path fill="#FF5F00" d="M24,17c-3.866,0-7,3.134-7,7s3.134,7,7,7s7-3.134,7-7S27.866,17,24,17z M24,28c-2.209,0-4-1.791-4-4 s1.791-4,4-4s4,1.791,4,4S26.209,28,24,28z"></path>
    </svg>
);

export const PaypalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48" {...props}>
        <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"></path><path fill="#FFF" d="M22.003,16.518c-1.392-0.126-2.24-0.021-2.24-0.021c-1.127,0-2.022,0.852-2.115,1.936 c-0.003,0.011-0.036,0.223-0.036,0.223c-0.21,1.25,0.589,2.373,1.78,2.613c0.01,0.002,0.02,0.004,0.03,0.006 c1.189,0.24,2.775,0.02,3.38-0.379c0.003-0.002,0.006-0.004,0.008-0.006c0.593-0.395,0.853-1.09,0.732-1.723 C23.364,18.291,22.84,16.581,22.003,16.518z M22.76,24.321c-0.816,2.289-2.61,3.43-4.814,3.43c-0.638,0-1.238-0.113-1.787-0.32 c-0.001,0-0.002-0.001-0.003-0.001c-1.119-0.421-1.849-1.467-1.9-2.656l-1.077-6.529c-0.028-0.171-0.043-0.344-0.043-0.519 c0-0.825,0.67-1.495,1.495-1.495h0.001c0.825,0,1.524,0.627,1.589,1.446c0,0.001,0,0.002,0,0.003l0.323,1.958 c0.042,0.251,0.27,0.428,0.525,0.428h0.739c1.688,0,3.058,1.37,3.058,3.058C23.001,23.496,22.923,23.931,22.76,24.321z M28.73,18.067c-0.53-0.92-1.423-1.528-2.47-1.554c-0.902-0.022-1.734,0.448-2.213,1.233c-0.494,0.809-0.59,1.834-0.273,2.753 c0.32,0.916,1.021,1.597,1.896,1.895c0.003,0.001,0.006,0.002,0.009,0.003c0.88,0.297,1.828,0.146,2.613-0.402 c0.84-0.59,1.339-1.523,1.339-2.553C29.623,19.227,29.289,18.521,28.73,18.067z M35.568,16.483 c-1.392-0.126-2.24-0.021-2.24-0.021c-1.127,0-2.022,0.852-2.115,1.936c-0.003,0.011-0.036,0.223-0.036,0.223 c-0.21,1.25,0.589,2.373,1.78,2.613c0.01,0.002,0.02,0.004,0.03,0.006c1.189,0.24,2.775,0.02,3.38-0.379 c0.003-0.002,0.006-0.004,0.008-0.006c0.593-0.395,0.853-1.09,0.732-1.723C36.929,18.256,36.405,16.546,35.568,16.483z M36.325,24.286c-0.816,2.289-2.61,3.43-4.814,3.43c-0.638,0-1.238-0.113-1.787-0.32c-0.001,0-0.002-0.001-0.003-0.001 c-1.119-0.421-1.849-1.467-1.9-2.656l-1.077-6.529c-0.028-0.171-0.043-0.344-0.043-0.519c0-0.825,0.67-1.495,1.495-1.495h0.001 c0.825,0,1.524,0.627,1.589,1.446c0,0.001,0,0.002,0,0.003l0.323,1.958c0.042,0.251,0.27,0.428,0.525,0.428h0.739 c1.688,0,3.058,1.37,3.058,3.058C36.566,23.461,36.488,23.896,36.325,24.286z"></path>
    </svg>
);