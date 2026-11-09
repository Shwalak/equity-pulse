import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HowItWorks } from "@/components/HowItWorks";
import { PulseHero } from "@/components/PulseHero";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <PulseHero />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
