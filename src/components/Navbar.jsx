import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ data, scrolled, scrollDirection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen((open) => !open);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  // Lock background scroll while the mobile menu is open
  useEffect(() => {
    document.body.classList.toggle('menu-open', mobileMenuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [mobileMenuOpen]);

  // Keep the navbar visible whenever the menu is open, even on scroll-down
  const hidden = scrollDirection === 'down' && !mobileMenuOpen;

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''} ${hidden ? 'hidden' : ''}`}>
      <div className="nav-logo">
        <Link to="/">{data.logo}</Link>
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
            <a href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
};

export default Navbar;
