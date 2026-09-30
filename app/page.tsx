import { Explore } from "@/components/Explore";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LaunchGallery } from "@/components/LaunchGallery";
import { Mechanic } from "@/components/Mechanic";
import { testLaunches } from "@/lib/launches";

export default function Home() {
  return (
    <main>
      <Hero />
      <LaunchGallery feed={{ launches: testLaunches, live: false, source: "demo" }} />
      <Mechanic />
      <HowItWorks />
      <Explore launches={testLaunches} />
      <Footer />
    </main>
  );
}
