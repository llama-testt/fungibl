import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { DeployFactory } from "@/components/DeployFactory";

export const metadata = { title: "Deploy — Fungibl", robots: { index: false } };

export default function DeployPage() {
  return (
    <main>
      <Navbar variant="paper" />
      <DeployFactory />
      <Footer />
    </main>
  );
}
