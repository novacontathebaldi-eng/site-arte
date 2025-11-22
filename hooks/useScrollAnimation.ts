import { useInView, UseInViewOptions } from 'framer-motion';
import { useRef } from 'react';

export const useScrollAnimation = (options?: UseInViewOptions) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -50px 0px",
    ...options
  });

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return { ref, isInView, variants };
};
