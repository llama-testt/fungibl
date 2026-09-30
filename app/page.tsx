import { CreateFlow } from "@/components/CreateFlow";
import { Explore } from "@/components/Explore";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LaunchGallery } from "@/components/LaunchGallery";
import { Mechanic } from "@/components/Mechanic";

export default function Home() {
  return (
    <main>
      <Hero />
      <LaunchGallery />
      <Mechanic />
      <HowItWorks />
      <Explore limit={6} />
      <CreateFlow />
      <Footer />
    </main>
  );
}
