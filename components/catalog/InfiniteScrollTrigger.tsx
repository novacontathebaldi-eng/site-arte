
import React, { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  onVisible: () => void;
}

const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({ onVisible }) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible();
        }
      },
      { threshold: 1.0 }
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
  }, [onVisible]);

  return <div ref={triggerRef} style={{ height: '1px' }} />;
};

export default InfiniteScrollTrigger;