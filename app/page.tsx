import { Explore } from "@/components/Explore";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LaunchGallery } from "@/components/LaunchGallery";
import { Mechanic } from "@/components/Mechanic";
import { getLaunchFeed } from "@/lib/pons/server";
import { testLaunches } from "@/lib/launches";

export const revalidate = 30;

export default async function Home() {
  const feed = await getLaunchFeed(24);
  return (
    <main>
      <Hero />
      <LaunchGallery feed={feed} />
      <Mechanic />
      <HowItWorks />
      <Explore launches={testLaunches} />
      <Footer />
    </main>
  );
}
