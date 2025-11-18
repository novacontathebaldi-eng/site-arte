import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';
import { AccordionItem } from '../types';

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenIndex?: number;
}

const Accordion: React.FC<AccordionProps> = ({ items, defaultOpenIndex }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex !== undefined ? defaultOpenIndex : null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="border-t">
      {items.map((item, index) => (
        <div key={index} className="border-b">
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex justify-between items-center py-4 text-left"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-base-text">{item.title}</span>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? 'max-h-screen' : 'max-h-0'
            }`}
          >
            <div className="pb-4 text-gray-600 text-sm">
                {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;