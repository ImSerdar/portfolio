import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ data, activeSection, onNavClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (e, href) => {
    setMobileMenuOpen(false);
    if (onNavClick) {
      onNavClick(e, href);
    }
  };

  const isLinkActive = (href) => {
    if (location.pathname === '/showcase' && href === '/showcase') return true;
    if (location.pathname !== '/') return false;
    
    if (href === '/#services' && activeSection === 2) return true;
    if (href === '/#process' && activeSection === 3) return true;
    if (href === '/#work' && activeSection === 4) return true;
    if (href === '/#contact' && activeSection === 6) return true;
    
    return false;
  };

  return (
    <header className="navbar scrolled">
      <div className="nav-logo">
        <Link to="/" onClick={(e) => handleNavClick(e, '/')}>Serdar<span>.</span></Link>
      </div>
      
      <button 
        className={`menu-toggle ${mobileMenuOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {data.navLinks.map((link, index) => (
          <li key={index}>
            <a 
              href={link.href} 
              onClick={(e) => handleNavClick(e, link.href)}
              className={isLinkActive(link.href) ? 'active' : ''}
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
};

export default Navbar;

