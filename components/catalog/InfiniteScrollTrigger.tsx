
import React, { useRef, useEffect } from 'react';

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
}

const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({ onIntersect }) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    const currentRef = triggerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onIntersect]);

  return <div ref={triggerRef} aria-hidden="true" />;
};

export default InfiniteScrollTrigger;
