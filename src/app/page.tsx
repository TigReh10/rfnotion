import { Hero } from "@/components/landing/hero";
import {
  TrustBar,
  Features,
  Showcase,
  Steps,
  Testimonials,
  Faq,
  CallToAction,
} from "@/components/landing/sections";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <div className="relative">
      <SiteHeader />

      <main>
        <Hero />
        <TrustBar />
        <Features />
        <Showcase />
        <Steps />
        <Testimonials />
        <Faq />
        <CallToAction />
      </main>

      <SiteFooter />
    </div>
  );
}
