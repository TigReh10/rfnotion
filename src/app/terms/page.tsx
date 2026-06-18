import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Terms of Service",
  description: "The terms and conditions for using ResumeForge AI.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Acceptance of Terms",
    body: [
      "By creating an account or using ResumeForge AI (the \u201cService\u201d), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.",
    ],
  },
  {
    heading: "2. Description of Service",
    body: [
      "ResumeForge AI provides AI-assisted resume analysis, job matching, cover letter generation, interview preparation, and related career tools. Features and limits depend on your subscription plan.",
    ],
  },
  {
    heading: "3. Accounts and Eligibility",
    body: [
      "You must be at least 16 years old and provide accurate registration information. You are responsible for safeguarding your password and for all activity under your account.",
    ],
  },
  {
    heading: "4. Subscriptions and Billing",
    body: [
      "Paid plans are billed in advance on a monthly or annual basis through our payment processor. Prices are displayed in USD. Subscriptions renew automatically until cancelled. You can cancel at any time, and cancellation takes effect at the end of the current billing period.",
    ],
  },
  {
    heading: "5. Acceptable Use",
    body: [
      "You agree not to misuse the Service, including by uploading unlawful content, attempting to reverse engineer the Service, scraping, or overloading our infrastructure. We may suspend accounts that violate these terms.",
    ],
  },
  {
    heading: "6. Intellectual Property",
    body: [
      "You retain ownership of the resume content and documents you upload. You grant us a limited licence to process that content solely to provide the Service. The Service, its software, and branding remain our property.",
    ],
  },
  {
    heading: "7. AI-Generated Content",
    body: [
      "AI-generated suggestions, scores, and text are provided for guidance only and may contain inaccuracies. You are responsible for reviewing all output before relying on or submitting it.",
    ],
  },
  {
    heading: "8. Disclaimers and Limitation of Liability",
    body: [
      "The Service is provided \u201cas is\u201d without warranties of any kind. We do not guarantee employment outcomes. To the maximum extent permitted by law, our liability is limited to the amount you paid for the Service in the preceding twelve months.",
    ],
  },
  {
    heading: "9. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Material changes will be communicated through the Service or by email. Continued use after changes take effect constitutes acceptance.",
    ],
  },
  {
    heading: "10. Contact",
    body: [
      "Questions about these Terms can be sent to support@resumeforge.ai.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-36">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: June 2026</p>
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
          This is a general template provided for convenience. Have it reviewed by
          a qualified lawyer and fill in your legal entity details before launch.
        </div>
        <div className="mt-10 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
