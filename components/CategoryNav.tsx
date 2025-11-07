import React, { useRef, useEffect } from 'react';
import { SearchIcon } from './ui/icons';

interface CategoryNavProps {
  categories: { id: string; label: string }[];
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
  onSearchClick: () => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ categories, activeCategory, onCategoryClick, onSearchClick }) => {
  const navRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  // Effect to center the active category button
  useEffect(() => {
    const activeItem = itemsRef.current[activeCategory];
    if (activeItem && navRef.current) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategory]);

  return (
    // The header is sticky with h-20 (80px), so this should be sticky at top-20
    <div ref={navRef} className="sticky top-20 z-30 lg:hidden bg-white/80 backdrop-blur-sm shadow-md overflow-hidden">
      <div className="flex items-center">
        <div className="flex-grow overflow-x-auto whitespace-nowrap no-scrollbar py-3 px-2">
          {categories.map(({ id, label }) => (
            <button
              key={id}
              // FIX: Changed ref callback from an expression to a block statement.
              // An assignment expression returns the assigned value, which is not allowed for a ref callback.
              // Wrapping the assignment in curly braces ensures the function returns undefined.
              ref={(el) => { itemsRef.current[id] = el; }}
              onClick={() => onCategoryClick(id)}
              className={`inline-block px-4 py-1.5 mx-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
                activeCategory === id
                  ? 'bg-primary text-white shadow'
                  : 'bg-surface text-text-secondary hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-shrink-0 pr-4 pl-2 border-l border-gray-200">
          <button onClick={onSearchClick} className="p-2 rounded-full hover:bg-surface" aria-label="Search">
            <SearchIcon className="w-6 h-6 text-text-primary" />
          </button>
        </div>
      </div>
      {/* Helper style to hide scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryNav;
