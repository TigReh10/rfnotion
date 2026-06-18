import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Refund Policy",
  description: "ResumeForge AI refund and cancellation policy.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Free Plan",
    body: [
      "Our Free plan lets you evaluate ResumeForge AI at no cost. We encourage you to try it before subscribing to a paid plan.",
    ],
  },
  {
    heading: "2. Subscriptions",
    body: [
      "Paid subscriptions are billed in advance. You can cancel at any time from your account settings; your plan remains active until the end of the current billing period and will not renew afterward.",
    ],
  },
  {
    heading: "3. 7-Day Money-Back Guarantee",
    body: [
      "If you are not satisfied with a new paid subscription, contact us within 7 days of your first payment for a full refund of that initial charge. This applies to your first purchase only.",
    ],
  },
  {
    heading: "4. Renewals",
    body: [
      "Renewal charges are generally non-refundable. To avoid being charged for the next period, cancel before your renewal date. We may consider exceptions for accidental renewals on a case-by-case basis.",
    ],
  },
  {
    heading: "5. How to Request a Refund",
    body: [
      "Email billing@resumeforge.ai from your account email with your request. Eligible refunds are processed to your original payment method, typically within 5\u201310 business days depending on your bank or card provider.",
    ],
  },
  {
    heading: "6. Currency and Conversion",
    body: [
      "Charges are processed in USD. If your card is in another currency, your bank's exchange rate and any foreign transaction fees apply, and refunds are issued in the original charge currency.",
    ],
  },
  {
    heading: "7. Contact",
    body: [
      "For any billing questions, reach us at billing@resumeforge.ai.",
    ],
  },
];

export default function RefundPage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-36">
        <h1 className="text-4xl font-extrabold tracking-tight">Refund Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: June 2026</p>
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
          This is a general template provided for convenience. Adjust the terms to
          match your business and local consumer law before launch.
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
