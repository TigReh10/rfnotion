"use client";

import { type ReactNode, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Explicit mutable tuple: a readonly (`as const`) tuple is NOT assignable to
// Framer Motion's cubic-bezier `ease` type and fails the type-check.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Fade-in + slide-up the moment an element enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 40,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  // Reduced motion: render content statically (already visible, no transform).
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial = { opacity: 0, y };
  const inView = { opacity: 1, y: 0 };
  const viewport = { once, margin: "-80px" };
  const transition = { duration: 0.7, ease: EASE, delay };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={inView}
      viewport={viewport}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

const staggerViewport = { once: true, margin: "-60px" };

/** Parent that staggers the reveal of its <StaggerItem> children. */
export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={staggerViewport}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/** Subtle vertical parallax driven by scroll position. */
export function Parallax({
  children,
  className,
  distance = 80,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Hooks must run unconditionally; the resulting motion value is simply not
  // applied when the user prefers reduced motion.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const style = reduceMotion ? undefined : { y };

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={style} className={reduceMotion ? undefined : "will-change-transform"}>
        {children}
      </motion.div>
    </div>
  );
}

export { motion, useScroll, useTransform };
