import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ data, scrolled, scrollDirection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (e, href) => {
    setMobileMenuOpen(false);
    // If it's a relative hash, let's use default behavior which we handle differently
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''} ${scrollDirection === 'down' ? 'hidden' : ''}`}>
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
