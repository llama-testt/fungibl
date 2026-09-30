import { Explore } from "@/components/Explore";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata = { title: "Explore — Fungibl" };

export default function ExplorePage() {
  return (
    <main>
      <Navbar variant="paper" />
      <div className="-mt-12 md:-mt-[7vw]">
        <Explore index="—" />
      </div>
      <Footer />
    </main>
  );
}
