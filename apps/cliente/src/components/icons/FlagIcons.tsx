import React from 'react';

// Este arquivo contém os componentes para as bandeiras dos países,
// que são usadas no seletor de idiomas. Usar SVGs diretamente no código
// é eficiente e garante que as imagens fiquem nítidas em qualquer tamanho.

export const FR: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" {...props}>
    <path fill="#002395" d="M0 0h1v2H0z" />
    <path fill="#fff" d="M1 0h1v2H1z" />
    <path fill="#ed2939" d="M2 0h1v2H2z" />
  </svg>
);

export const GB: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" {...props}>
    <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
    <path fill="#00247d" d="M0 0v30h60V0z"/>
    <path stroke="#fff" strokeWidth="6" d="M0 0l60 30m0-30L0 30"/>
    <path stroke="#cf142b" strokeWidth="4" d="M0 0l60 30m0-30L0 30" clipPath="url(#a)"/>
    <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60"/>
    <path stroke="#cf142b" strokeWidth="6" d="M30 0v30M0 15h60"/>
  </svg>
);

export const DE: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" {...props}>
    <path d="M0 0h5v3H0z" />
    <path fill="#D00" d="M0 1h5v2H0z" />
    <path fill="#FFCE00" d="M0 2h5v1H0z" />
  </svg>
);

export const PT: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" {...props}>
    <path fill="#006241" d="M0 0h480v800H0z"/>
    <path fill="#d21034" d="M480 0h720v800H480z"/>
    <circle cx="480" cy="400" r="150" fill="#ffc72c"/>
    <circle cx="480" cy="400" r="120" fill="#fff"/>
  </svg>
);