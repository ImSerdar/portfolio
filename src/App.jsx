import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Showcase from './pages/Showcase';
import EcommerceDemo from './pages/EcommerceDemo';
import WorkflowDemo from './pages/WorkflowDemo';
import CorporateDemo from './pages/CorporateDemo';
import FitnessDemo from './pages/FitnessDemo';
import CryptoDemo from './pages/CryptoDemo';
import AgencyDemo from './pages/AgencyDemo';
import { PORTFOLIO_DATA } from './data';

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setScrolled(currentScrollY > 50);
      
      // Determine scroll direction (only hide navbar after initial 100px)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <BrowserRouter>
      <div className="bg-blobs"></div>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <>
              <Navbar data={PORTFOLIO_DATA.header} scrolled={scrolled} scrollDirection={scrollDirection} />
              <Home />
            </>
          } />
          <Route path="/showcase" element={
            <>
              <Navbar data={PORTFOLIO_DATA.header} scrolled={scrolled} scrollDirection={scrollDirection} />
              <Showcase data={PORTFOLIO_DATA.showcase} />
            </>
          } />
          
          {/* Isolated Functional Demos */}
          <Route path="/demo/ecommerce" element={<EcommerceDemo />} />
          <Route path="/demo/workflow" element={<WorkflowDemo />} />
          <Route path="/demo/corporate" element={<CorporateDemo />} />
          <Route path="/demo/fitness" element={<FitnessDemo />} />
          <Route path="/demo/crypto" element={<CryptoDemo />} />
          <Route path="/demo/agency" element={<AgencyDemo />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
