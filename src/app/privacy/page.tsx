import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Privacy Policy",
  description: "How ResumeForge AI collects, uses, and protects your data.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Information We Collect",
    body: [
      "Account data such as your name and email; content you upload such as resumes and job descriptions; usage data such as feature interactions; and technical data such as IP address and device information.",
    ],
  },
  {
    heading: "2. How We Use Your Information",
    body: [
      "To provide and improve the Service, generate AI analysis and suggestions, process payments, communicate with you, ensure security, and comply with legal obligations.",
    ],
  },
  {
    heading: "3. AI Processing",
    body: [
      "Resume and job content may be sent to third-party AI providers (such as OpenAI and Anthropic) to generate analysis and text. We only send what is needed to deliver the requested feature.",
    ],
  },
  {
    heading: "4. Data Sharing",
    body: [
      "We do not sell your personal data. We share data only with service providers that help us operate (payment processing, cloud hosting, AI providers, email delivery), each bound by confidentiality obligations.",
    ],
  },
  {
    heading: "5. Data Retention",
    body: [
      "We retain your data while your account is active and as needed to comply with legal obligations. You can delete your resumes or your account at any time from your settings.",
    ],
  },
  {
    heading: "6. Your Rights (GDPR)",
    body: [
      "Depending on your location, you may have the right to access, correct, export, or delete your personal data, and to object to or restrict certain processing. To exercise these rights, contact us at privacy@resumeforge.ai.",
    ],
  },
  {
    heading: "7. Security",
    body: [
      "We use encryption in transit, hashed passwords, access controls, and audit logging to protect your data. No method of transmission or storage is completely secure, but we work to protect your information.",
    ],
  },
  {
    heading: "8. Cookies",
    body: [
      "We use essential cookies for authentication and preferences (such as your light/dark theme). We do not use cookies to sell your data.",
    ],
  },
  {
    heading: "9. Children",
    body: [
      "The Service is not intended for users under 16, and we do not knowingly collect data from them.",
    ],
  },
  {
    heading: "10. Contact",
    body: [
      "For privacy questions or requests, email privacy@resumeforge.ai.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-36">
        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
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
