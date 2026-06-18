import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for ResumeForge AI. Start free, upgrade when you are ready.",
};

interface Tier {
  name: string;
  price: number;
  annual?: number;
  tagline: string;
  cta: string;
  href: string;
  highlighted: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: "Free",
    price: 0,
    tagline: "Try it out and land your first quick win.",
    cta: "Get started",
    href: "/register",
    highlighted: false,
    features: [
      "3 resume analyses / month",
      "ATS compatibility score",
      "Basic improvement suggestions",
      "1 stored resume",
    ],
  },
  {
    name: "Pro",
    price: 19,
    annual: 190,
    tagline: "Everything you need for an active job search.",
    cta: "Upgrade to Pro",
    href: "/register?plan=pro_monthly",
    highlighted: true,
    features: [
      "200 analyses / month",
      "Job match & fit scoring",
      "AI cover letters (all tones)",
      "Interview prep generator",
      "Version history",
      "Unlimited stored resumes",
    ],
  },
  {
    name: "Premium",
    price: 49,
    annual: 490,
    tagline: "Maximum firepower for serious career moves.",
    cta: "Go Premium",
    href: "/register?plan=pro_premium",
    highlighted: false,
    features: [
      "Unlimited analyses",
      "LinkedIn profile optimizer",
      "Priority AI (GPT-4o + Claude)",
      "Skill-gap & career roadmap insights",
      "Priority processing queue",
      "Early access to new features",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 pb-28 pt-36">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur">
            Simple, transparent pricing
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight md:text-6xl">
            Choose the plan that gets you hired
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Start free, no credit card required. Upgrade any time as your job
            search heats up. Cancel whenever you want.
          </p>
        </Reveal>

        <StaggerGroup className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const cardClass = tier.highlighted
              ? "relative rounded-3xl border-2 border-primary bg-card p-8 shadow-xl shadow-primary/10"
              : "relative rounded-3xl border bg-card p-8";
            const ctaClass = tier.highlighted
              ? "mt-8 block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:scale-[1.03]"
              : "mt-8 block rounded-full border px-6 py-3 text-center text-sm font-semibold transition hover:bg-muted";
            return (
              <StaggerItem key={tier.name} className={cardClass}>
                {tier.highlighted ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                ) : null}
                <h2 className="text-lg font-semibold">{tier.name}</h2>
                <p className="mt-1 min-h-10 text-sm text-muted-foreground">{tier.tagline}</p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">${tier.price}</span>
                  <span className="mb-1 text-sm text-muted-foreground">
                    {tier.price === 0 ? "/ forever" : "/ month"}
                  </span>
                </div>
                {tier.annual ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    or ${tier.annual} billed yearly (save ~17%)
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">No card required</p>
                )}
                <Link href={tier.href} className={ctaClass}>
                  {tier.cta}
                </Link>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <Reveal className="mx-auto mt-16 max-w-2xl text-center text-sm text-muted-foreground">
          <p>
            All prices are in USD and billed securely through Stripe. International
            cards (US / EU) are accepted. Taxes may apply based on your region.
          </p>
        </Reveal>
      </main>

      <SiteFooter />
    </div>
  );
}
