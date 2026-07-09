import Hero from "@/components/Hero";
import FeaturedProjects from "@/components/FeaturedProjects";
import AuditSection from "@/components/AuditSection";
import DemoSection from "@/components/DemoSection";
import WhatYouGet from "@/components/WhatYouGet";
import Investment from "@/components/Investment";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <AuditSection />
      <DemoSection />
      <WhatYouGet />
      <Investment />
      <FinalCTA />
      <Footer />
    </>
  );
}
