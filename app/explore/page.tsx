import { Explore } from "@/components/Explore";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { getLaunchFeed } from "@/lib/pons/server";

export const metadata = { title: "Explore — Fungibl" };
export const revalidate = 30;

export default async function ExplorePage() {
  const feed = await getLaunchFeed(48);
  return (
    <main>
      <Navbar variant="paper" />
      <div className="-mt-12 md:-mt-[7vw]">
        <Explore index="—" launches={feed.launches} live={feed.live} />
      </div>
      <Footer />
    </main>
  );
}
