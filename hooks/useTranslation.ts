
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

// Este é um "Hook" customizado. É uma forma de reutilizar lógica em React.
// O objetivo deste hook é simplificar o uso do nosso LanguageContext.

export const useTranslation = () => {
  // 1. Pega o contexto que criamos.
  const context = useContext(LanguageContext);

  // 2. Garante que o hook está sendo usado dentro de um LanguageProvider.
  // Se 'context' for undefined, significa que esquecemos de colocar o Provider
  // em volta de algum componente, e isso gera um erro claro.
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  // 3. Retorna os valores do contexto (o idioma, a função para mudar o idioma, e a função de tradução 't').
  // Agora, em qualquer componente, em vez de importar o useContext e o LanguageContext,
  // podemos simplesmente chamar `const { t } = useTranslation();`, que é muito mais limpo.
  return context;
};
