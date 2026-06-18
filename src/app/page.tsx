import { Hero } from "@/components/landing/hero";
import { Features, Showcase, Steps, CallToAction } from "@/components/landing/sections";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <div className="relative">
      <SiteHeader />

      <main>
        <Hero />
        <Features />
        <Showcase />
        <Steps />
        <CallToAction />
      </main>

      <SiteFooter />
    </div>
  );
}
