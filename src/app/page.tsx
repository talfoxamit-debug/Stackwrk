import Hero from "@/components/Hero";
import FeaturedProjects from "@/components/FeaturedProjects";
import AuditSection from "@/components/AuditSection";
import DemoSection from "@/components/DemoSection";
import WhatYouGet from "@/components/WhatYouGet";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Investment from "@/components/Investment";
import Guarantee from "@/components/Guarantee";
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
      <HowItWorks />
      <Testimonials />
      <Investment />
      <Guarantee />
      <FinalCTA />
      <Footer />
    </>
  );
}
