import { LandingNav } from "@/src/components/landing/LandingNav";
import { HeroSection } from "@/src/components/landing/HeroSection";
import { EncryptionSection } from "@/src/components/landing/EncryptionSection";
import { FeaturesSection } from "@/src/components/landing/FeaturesSection";
import { CTASection, Footer } from "@/src/components/landing/CTASection";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080808]">
      <LandingNav />
      <HeroSection />
      <div id="encryption">
        <EncryptionSection />
      </div>
      <div id="features">
        <FeaturesSection />
      </div>
      <CTASection />
      <Footer />
    </main>
  );
}
