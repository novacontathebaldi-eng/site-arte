import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number; // 0 to 1
  delay?: string; // css transition delay
  animation?: 'fade-in-up' | 'scale-in' | 'fade';
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  className = "", 
  threshold = 0.2, 
  delay = "0ms",
  animation = 'fade-in-up' 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: threshold,
        rootMargin: "0px 0px -50px 0px" 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0 translate-y-8 scale-95'; // Initial state
    
    switch (animation) {
      case 'scale-in':
        return 'opacity-100 translate-y-0 scale-100 animate-scale-in';
      case 'fade':
        return 'opacity-100 translate-y-0 scale-100 duration-1000 transition-opacity';
      case 'fade-in-up':
      default:
        return 'opacity-100 translate-y-0 scale-100 animate-fade-in-up';
    }
  };

  return (
    <div 
      ref={ref} 
      className={`transform transition-all duration-700 ease-out ${getAnimationClass()} ${className}`}
      style={{ animationDelay: delay, transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

export default Reveal;