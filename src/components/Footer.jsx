import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="portfolio-footer">
      <div className="portfolio-footer-inner">
        <div className="footer-brand">Serdar.</div>
        <div className="footer-links">
          <a href="/#services">Services</a>
          <a href="/#work">Work</a>
          <a href="/showcase">Showcase</a>
          <a href="/#contact">Contact</a>
        </div>
        <div className="footer-copy">
          &copy; {year} Serdar. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
