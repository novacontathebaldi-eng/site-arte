import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import { ROUTES } from '../constants';
import CartIcon from './CartIcon';

// Este é o componente do Cabeçalho (Header). Ele aparece no topo de todas as páginas.
const Header: React.FC = () => {
  const { t } = useTranslation(); // Hook para obter a função de tradução.
  const [isScrolled, setIsScrolled] = useState(false);

  // Este useEffect monitora a rolagem da página.
  // Quando o usuário rola para baixo, adicionamos uma sombra e um fundo ao cabeçalho
  // para que ele se destaque do conteúdo.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    // 'Cleanup function': remove o monitoramento quando o componente é desmontado para evitar memory leaks.
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para aplicar classes CSS aos links de navegação, destacando o link ativo.
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `relative py-2 text-sm font-medium transition-colors duration-300 ${
      isActive ? 'text-secondary' : 'text-text-primary hover:text-secondary'
    } after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-secondary after:transition-all after:duration-300 ${
      isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Nome da Artista - Clicável para voltar para a Home */}
          <Link to={ROUTES.HOME} className="text-2xl font-heading font-bold text-primary">
            Melissa Pelussi
          </Link>

          {/* Navegação Principal */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to={ROUTES.CATALOG} className={navLinkClasses}>
              {t('header.catalog')}
            </NavLink>
            <NavLink to={ROUTES.ABOUT} className={navLinkClasses}>
              {t('header.about')}
            </NavLink>
            <NavLink to={ROUTES.CONTACT} className={navLinkClasses}>
              {t('header.contact')}
            </NavLink>
          </nav>

          {/* Ícones da direita: Seletor de Idioma e Carrinho */}
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <CartIcon />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
