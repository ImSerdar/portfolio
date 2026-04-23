import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Services from '../components/Services';
import Marquee from '../components/Marquee';
import Process from '../components/Process';
import Work from '../components/Work';
import CTABanner from '../components/CTABanner';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';
import { PORTFOLIO_DATA } from '../data';

const useHashScroll = () => {
  useEffect(() => {
    if (window.location.hash) {
      const element = document.getElementById(window.location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);
};

const Home = () => {
  useHashScroll();

  return (
    <main>
      <Hero data={PORTFOLIO_DATA.hero} />
      <Stats data={PORTFOLIO_DATA.stats} />
      <Services data={PORTFOLIO_DATA.services} />
      <Marquee />
      <Process data={PORTFOLIO_DATA.process} />
      <Work data={PORTFOLIO_DATA.work} />
      <CTABanner data={PORTFOLIO_DATA.ctaBanner} />
      <Contact data={PORTFOLIO_DATA.contact} />
      <Footer />
      <StickyCTA />
    </main>
  );
};

export default Home;
