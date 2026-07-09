import Hero from "@/components/Hero";
import IndustryGreeting from "@/components/IndustryGreeting";
import StickyCTA from "@/components/StickyCTA";
import FeaturedProjects from "@/components/FeaturedProjects";
import MetricsBand from "@/components/MetricsBand";
import SectionSeam from "@/components/SectionSeam";
import AuditSection from "@/components/AuditSection";
import DemoSection from "@/components/DemoSection";
import WhatYouGet from "@/components/WhatYouGet";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Investment from "@/components/Investment";
import Plans from "@/components/Plans";
import Guarantee from "@/components/Guarantee";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <IndustryGreeting />
      <FeaturedProjects />
      <MetricsBand />
      <AuditSection />
      <DemoSection />
      <SectionSeam hue="violet" />
      <WhatYouGet />
      <HowItWorks />
      <Testimonials />
      <Investment />
      <SectionSeam hue="magenta" />
      <Plans />
      <Guarantee />
      <FinalCTA />
      <Footer />
      <StickyCTA />
    </>
  );
}
