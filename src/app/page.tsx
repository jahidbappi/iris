import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Architecture } from "@/components/landing/Architecture";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Features />
        <Architecture />
      </main>
      <SiteFooter />
    </>
  );
}
