import { CreateFlow } from "@/components/CreateFlow";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata = { title: "Create — Fungibl" };

export default function CreatePage() {
  return (
    <main>
      <Navbar variant="paper" />
      <div className="-mt-12 md:-mt-[7vw]">
        <CreateFlow index="—" />
      </div>
      <Footer />
    </main>
  );
}
