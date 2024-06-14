'use client';
import { easeIn, motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import React from 'react';
import { cn } from '@/lib/utils';
interface FadeInUpWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}
export const FadeInUpWrapper = ({ children, className, delay = 0 }: FadeInUpWrapperProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  useEffect(() => {
    if (inView && window !== undefined) {
      controls.start('visible');
    }
  }, [controls, inView]);
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay,
        ease: easeIn,
      },
    },
  };
  return (
    <motion.div
      ref={ref}
      initial={variants.hidden}
      animate={controls}
      variants={variants}
      className={cn([className])}
    >
      {inView && children}
    </motion.div>
  );
};
interface StaggeredFadeInUpWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}
export const StaggeredFadeInUpWrapper = ({
  children,
  className,
  delay = 0,
}: StaggeredFadeInUpWrapperProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay,
        ease: easeIn,
      },
    },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={cn([className])}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div variants={itemVariants} key={index}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
