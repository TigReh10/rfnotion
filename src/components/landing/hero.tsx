"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Apple-style scrollytelling hero. The section is tall; an inner sticky layer
 * pins to the viewport while the headline mock-up scales up and the intro copy
 * fades + drifts as scroll progresses.
 *
 * When the user prefers reduced motion we drop the oversized scroll track and
 * the scroll-driven transforms entirely, rendering a calm, static hero.
 */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  // Hooks run unconditionally; their motion values are only applied when motion
  // is allowed.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const copyOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.45], [0, -80]);
  const cardScale = useTransform(scrollYProgress, [0, 0.6], [0.92, 1.06]);
  const cardY = useTransform(scrollYProgress, [0, 0.6], [60, -40]);
  const cardRotate = useTransform(scrollYProgress, [0, 0.6], [6, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.15]);

  const copyStyle = reduceMotion ? undefined : { opacity: copyOpacity, y: copyY };
  const cardStyle = reduceMotion ? undefined : { scale: cardScale, y: cardY, rotateX: cardRotate };
  const glowStyle = reduceMotion ? { opacity: 0.3 } : { opacity: glowOpacity };

  return (
    <section ref={ref} className={reduceMotion ? "relative" : "relative h-[200vh]"}>
      <div
        className={
          reduceMotion
            ? "flex min-h-screen flex-col items-center justify-start overflow-hidden pt-28"
            : "sticky top-0 flex h-screen flex-col items-center justify-start overflow-hidden pt-28"
        }
      >
        <motion.div
          aria-hidden
          style={glowStyle}
          className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/30 blur-[120px]"
        />

        <motion.div style={copyStyle} className="z-10 max-w-3xl px-6 text-center">
          <span className="inline-flex items-center rounded-full border bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur">
            AI resume optimization · ATS-ready in seconds
          </span>
          <h1 className="mt-6 text-balance text-5xl font-extrabold tracking-tight md:text-7xl">
            Land more interviews
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            ResumeForge AI scores your resume against any job, rewrites it for ATS
            systems, and generates tailored cover letters and interview prep.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/30"
            >
              Analyze my resume free
            </Link>
            <Link
              href="#features"
              className="rounded-full border px-7 py-3 text-sm font-semibold transition hover:bg-card"
            >
              See how it works
            </Link>
          </div>
        </motion.div>

        <motion.div
          style={cardStyle}
          className="z-0 mt-16 w-full max-w-4xl px-6 [perspective:1200px]"
        >
          <div className="rounded-2xl border bg-card/80 p-2 shadow-2xl shadow-black/10 backdrop-blur">
            <div className="rounded-xl border bg-background">
              <div className="flex items-center gap-1.5 border-b px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-muted-foreground">resumeforge.ai/dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-4 p-6">
                <div className="col-span-1 space-y-3">
                  <div className="h-24 rounded-lg bg-primary/10" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-600">
                      ATS 92%
                    </div>
                  </div>
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-5/6 rounded bg-muted" />
                  <div className="h-3 w-4/6 rounded bg-muted" />
                  <div className="mt-4 h-20 rounded-lg bg-primary/5" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
