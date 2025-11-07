import React from 'react';

// Este componente mostra "esqueletos" de conteúdo enquanto os dados reais
// estão sendo carregados do servidor. Isso melhora a experiência do usuário
// porque ele vê que algo está acontecendo, e a página não "pula" quando o
// conteúdo finalmente chega.

// Esqueleto para um único ProductCard
export const ProductCardSkeleton: React.FC = () => (
  <div className="w-full animate-pulse">
    <div className="bg-gray-200 h-72 rounded-t-lg"></div>
    <div className="p-4 border border-t-0 rounded-b-lg border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

// Esqueleto para a grade de produtos no catálogo.
// Ele renderiza vários ProductCardSkeletons.
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Esqueleto para a página de detalhes de um produto.
export const ProductDetailSkeleton: React.FC = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            {/* Esqueleto da galeria de imagens */}
            <div>
                <div className="bg-gray-200 h-96 rounded-lg"></div>
                <div className="flex space-x-4 mt-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                    <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                    <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                </div>
            </div>

            {/* Esqueleto das informações do produto */}
            <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
                
                <div className="space-y-3 mb-8">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                 <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                 <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                 <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>

                <div className="h-12 bg-gray-200 rounded-lg w-full mt-8"></div>
            </div>
        </div>
    </div>
);

// Esqueleto para tabelas no painel de administração
export const AdminTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="w-full animate-pulse">
        {/* Header */}
        <div className="h-12 bg-gray-200 rounded-t-lg flex items-center px-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/6 ml-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-1/6 ml-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/6 ml-4"></div>
        </div>
        {/* Rows */}
        <div className="space-y-2 mt-2">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="h-16 bg-gray-200 rounded flex items-center px-4">
                    <div className="w-12 h-12 bg-gray-300 rounded"></div>
                    <div className="ml-4 space-y-2 flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);