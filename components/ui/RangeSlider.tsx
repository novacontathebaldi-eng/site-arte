import React, { useCallback, useEffect, useState, useRef } from 'react';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  currency?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ label, min, max, minValue, maxValue, onChange, currency }) => {
  const [minVal, setMinVal] = useState(minValue);
  const [maxVal, setMaxVal] = useState(maxValue);
  const minValRef = useRef(minValue);
  const maxValRef = useRef(maxValue);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback((value: number) => Math.round(((value - min) / (max - min)) * 100), [min, max]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Get min and max values when their state changes
  useEffect(() => {
    const handler = setTimeout(() => {
        onChange(minVal, maxVal);
    }, 300); // Debounce
    return () => clearTimeout(handler);
  }, [minVal, maxVal, onChange]);

  const formatValue = (value: number) => {
      if (currency) {
          return new Intl.NumberFormat('fr-LU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
      }
      return value.toString();
  }

  return (
    <div className="border-t pt-4">
      <h4 className="font-semibold mb-3">{label}</h4>
      <div className="relative h-10 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={(event) => {
            const value = Math.min(Number(event.target.value), maxVal - 1);
            setMinVal(value);
            minValRef.current = value;
          }}
          className="thumb thumb--left"
          style={{ zIndex: minVal > max - 100 ? 5 : undefined }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={(event) => {
            const value = Math.max(Number(event.target.value), minVal + 1);
            setMaxVal(value);
            maxValRef.current = value;
          }}
          className="thumb thumb--right"
        />
        <div className="relative w-full">
          <div className="absolute w-full h-1 rounded-md bg-gray-200" />
          <div ref={range} className="absolute h-1 rounded-md bg-secondary" />
        </div>
      </div>
      <div className="flex justify-between text-sm text-text-secondary mt-2">
        <span>{formatValue(minVal)}</span>
        <span>{formatValue(maxVal)}</span>
      </div>
       <style>{`
        .thumb {
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%;
          outline: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background: transparent;
        }
        
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: all;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #fff;
          border: 2px solid #D4AF37;
          cursor: pointer;
          margin-top: -9px;
        }
        
        .thumb::-moz-range-thumb {
          pointer-events: all;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #fff;
          border: 2px solid #D4AF37;
          cursor: pointer;
        }
        `}</style>
    </div>
  );
};

export default RangeSlider;
