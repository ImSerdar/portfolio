import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import DOMOverlay from './components/DOMOverlay';
import Navbar from './components/Navbar';
import { useVirtualScroll } from './hooks/useVirtualScroll';
import { PORTFOLIO_DATA } from './data';

// Import all sub-pages for routing
import Showcase from './pages/Showcase';
import EcommerceDemo from './pages/EcommerceDemo';
import WorkflowDemo from './pages/WorkflowDemo';
import CorporateDemo from './pages/CorporateDemo';
import FitnessDemo from './pages/FitnessDemo';
import CryptoDemo from './pages/CryptoDemo';
import AgencyDemo from './pages/AgencyDemo';

const SECTIONS = ['Home', 'Stats', 'Services', 'Process', 'Work', 'Elevate', 'Showcase', 'Contact'];

function DotIndicators({ activeSection, scrollTarget }) {
  return (
    <div className="dot-indicators">
      {SECTIONS.map((name, index) => (
        <button
          key={name}
          className={`dot-indicator ${activeSection === index ? 'active' : ''}`}
          onClick={() => scrollTarget.set(index)}
          title={name}
          aria-label={`Go to ${name}`}
        />
      ))}
    </div>
  );
}

function MainPortfolioView() {
  const { scrollTarget, smoothScroll } = useVirtualScroll({ totalSections: 8 });
  const [activeSection, setActiveSection] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Track active section to highlight dots and navbar links
  useEffect(() => {
    return scrollTarget.on('change', (latest) => {
      const current = Math.round(latest);
      setActiveSection(current);
    });
  }, [scrollTarget]);

  // Handle scroll bridging when navigating with hashes (e.g., from Showcase page)
  useEffect(() => {
    if (location.pathname === '/') {
      const hash = location.hash;
      const indexMap = {
        '#services': 2,
        '#process': 3,
        '#work': 4,
        '#contact': 7
      };
      const targetIdx = indexMap[hash];
      if (targetIdx !== undefined) {
        scrollTarget.set(targetIdx);
        // Clear hash after scrolling so it doesn't re-trigger
        navigate('/', { replace: true });
      }
    }
  }, [location, scrollTarget, navigate]);

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const sectionName = href.split('#')[1];
      const indexMap = {
        services: 2,
        process: 3,
        work: 4,
        contact: 7
      };
      const targetIdx = indexMap[sectionName];
      if (targetIdx !== undefined) {
        scrollTarget.set(targetIdx);
      }
    } else if (href === '/') {
      e.preventDefault();
      scrollTarget.set(0);
    } else {
      // Allow react-router to handle navigation (e.g. to /showcase)
      navigate(href);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Navbar data={PORTFOLIO_DATA.header} activeSection={activeSection} onNavClick={handleNavClick} />
      
      <Canvas gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
        <Scene scrollSmooth={smoothScroll} />
      </Canvas>
      
      <DOMOverlay scrollSmooth={smoothScroll} scrollTarget={scrollTarget} />
      
      <DotIndicators activeSection={activeSection} scrollTarget={scrollTarget} />
    </div>
  );
}

function DemoRouteWrapper() {
  const { demoId } = useParams();
  
  switch (demoId) {
    case 'ecommerce':
      return <EcommerceDemo />;
    case 'workflow':
      return <WorkflowDemo />;
    case 'corporate':
      return <CorporateDemo />;
    case 'fitness':
      return <FitnessDemo />;
    case 'crypto':
      return <CryptoDemo />;
    case 'agency':
      return <AgencyDemo />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white bg-slate-950 p-6">
          <h1 className="text-2xl font-bold mb-4">Demo Not Found</h1>
          <Link to="/" className="text-cyan-400 underline">Back to Portfolio</Link>
        </div>
      );
  }
}

function ShowcasePageWrapper() {
  const navigate = useNavigate();
  const handleNavClick = (e, href) => {
    if (href.startsWith('/#') || href === '/') {
      e.preventDefault();
      navigate('/' + (href === '/' ? '' : href));
    } else {
      navigate(href);
    }
  };

  return (
    <div className="showcase-page-container min-h-screen bg-[#050810] text-[#F3F4F6]">
      <Navbar data={PORTFOLIO_DATA.header} onNavClick={handleNavClick} />
      <div className="pt-24 pb-12 px-6">
        <Showcase data={PORTFOLIO_DATA.showcase} />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPortfolioView />} />
        <Route path="/showcase" element={<ShowcasePageWrapper />} />
        <Route path="/demo/:demoId" element={<DemoRouteWrapper />} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen text-white bg-[#050810]">
            <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
            <Link to="/" className="text-cyan-400 hover:underline">Return Home</Link>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
