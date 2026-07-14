import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PORTFOLIO_DATA } from '../data';

function SectionWrapper({ scrollSmooth, index, children, align = 'center' }) {
  // Fade in and out around the index
  const opacity = useTransform(
    scrollSmooth,
    [index - 0.6, index - 0.25, index, index + 0.25, index + 0.6],
    [0, 1, 1, 1, 0]
  );

  // translateZ spatial depth
  const z = useTransform(
    scrollSmooth,
    [index - 1, index, index + 1],
    [-500, 0, 800]
  );

  const scale = useTransform(
    scrollSmooth,
    [index - 1, index, index + 1],
    [0.85, 1, 1.15]
  );

  const [active, setActive] = useState(false);

  useEffect(() => {
    const update = (latest) => setActive(Math.abs(latest - index) < 0.45);
    update(scrollSmooth.get()); // initialize on mount so the landing section is interactive before any scroll
    return scrollSmooth.on("change", update);
  }, [scrollSmooth, index]);

  const getWrapperStyles = () => {
    let justifyStyle = { justifyContent: 'center' };
    if (align === 'left') {
      justifyStyle = { justifyContent: 'flex-start', paddingLeft: '10%' };
    } else if (align === 'right') {
      justifyStyle = { justifyContent: 'flex-end', paddingRight: '10%' };
    }
    return justifyStyle;
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        opacity,
        scale,
        z,
        transformStyle: 'preserve-3d',
        pointerEvents: active ? 'auto' : 'none',
        padding: '2rem',
        ...getWrapperStyles()
      }}
      className="section-wrapper"
    >
      <div className="section-content-container custom-scrollbar">
        {children}
      </div>
    </motion.div>
  );
}

export default function DOMOverlay({ scrollSmooth, scrollTarget }) {
  const handleCtaClick = (e, index) => {
    e.preventDefault();
    scrollTarget.set(index);
  };

  return (
    <div className="overlay-container">
      {/* 0. Hero Section */}
      <SectionWrapper scrollSmooth={scrollSmooth} index={0} align="left">
        <div className="hero-content" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="hero-badge animate-on-load">
            <span className="hero-badge-dot"></span>
            {PORTFOLIO_DATA.hero.badge}
          </div>
          <h1 className="animate-on-load" style={{ animationDelay: '0.1s' }}>
            {PORTFOLIO_DATA.hero.headline}
          </h1>
          <p className="animate-on-load" style={{ animationDelay: '0.2s' }}>
            {PORTFOLIO_DATA.hero.tagline}
          </p>
          <div className="hero-cta-group animate-on-load" style={{ animationDelay: '0.3s' }}>
            <a
              href={PORTFOLIO_DATA.hero.primaryCta.href}
              className="cta-button"
              onClick={(e) => handleCtaClick(e, 7)} // Go to Contact (section 7)
            >
              {PORTFOLIO_DATA.hero.primaryCta.text}
            </a>
            <a 
              href={PORTFOLIO_DATA.hero.secondaryCta.href} 
              className="cta-button cta-secondary"
              onClick={(e) => handleCtaClick(e, 4)} // Go to work (4)
            >
              {PORTFOLIO_DATA.hero.secondaryCta.text}
            </a>
          </div>
        </div>
      </SectionWrapper>

      {/* 1. Stats Section */}
      <SectionWrapper scrollSmooth={scrollSmooth} index={1} align="left">
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <h2 className="section-title" style={{ textAlign: 'left', display: 'block', width: '100%' }}>{PORTFOLIO_DATA.stats.title}</h2>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {PORTFOLIO_DATA.stats.items.map((stat, i) => (
              <div key={i} className="stat-item glass">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 2. Services Section */}
      <SectionWrapper scrollSmooth={scrollSmooth} index={2} align="left">
        <div style={{ maxWidth: '900px', width: '100%' }}>
          <h2 className="section-title" style={{ textAlign: 'left', display: 'block', width: '100%' }}>{PORTFOLIO_DATA.services.title}</h2>
          <div className="services-grid">
            {PORTFOLIO_DATA.services.items.map((service) => (
              <div key={service.id} className="service-card glass">
                <div className="service-icon-placeholder">
                  {service.id === 1 && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                  )}
                  {service.id === 2 && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  )}
                  {service.id === 3 && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  )}
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 3. Process Section */}
      <SectionWrapper scrollSmooth={scrollSmooth} index={3} align="left">
        <div style={{ maxWidth: '850px', width: '100%' }}>
          <h2 className="section-title" style={{ textAlign: 'left', display: 'block', width: '100%' }}>{PORTFOLIO_DATA.process.title}</h2>
          <p style={{ textAlign: 'left', color: 'var(--text-secondary)', marginBottom: '3rem' }}>{PORTFOLIO_DATA.process.subtitle}</p>
          <div className="process-grid">
            {PORTFOLIO_DATA.process.steps.map((step) => (
              <div key={step.id} className="process-step glass" style={{ borderTop: '4px solid var(--accent-cyan)' }}>
                <span className="process-number">{step.id}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 4. Work Section + CTA Banner */}
      <SectionWrapper scrollSmooth={scrollSmooth} index={4} align="left">
        <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
          <h2 className="section-title" style={{ textAlign: 'left', display: 'block', width: '100%' }}>{PORTFOLIO_DATA.work.title}</h2>
          <div className="work-grid">
            {PORTFOLIO_DATA.work.projects.map((project) => (
              <div key={project.id} className="project-card glass">
                <div className="project-image-wrapper" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }}>
                  <span style={{ fontSize: '3rem' }}>💻</span>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 'bold', marginTop: '0.5rem' }}>{project.tags[0]}</span>
                </div>
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <Link to={project.link} className="project-link">
                    View Demo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 5. CTA Section (Elevate) */}
      <SectionWrapper scrollSmooth={scrollSmooth} index={5} align="left">
        <div style={{ maxWidth: '900px', width: '100%', display: 'flex', alignItems: 'center', minHeight: '50vh' }}>
          <div className="cta-banner" style={{ margin: 0, width: '100%' }}>
            <div className="cta-banner-text">
              <h2>{PORTFOLIO_DATA.ctaBanner.headline}</h2>
              <p>{PORTFOLIO_DATA.ctaBanner.subtext}</p>
            </div>
            <a href={PORTFOLIO_DATA.ctaBanner.button.href} className="cta-button" onClick={(e) => handleCtaClick(e, 7)}>
              {PORTFOLIO_DATA.ctaBanner.button.text} &rarr;
            </a>
          </div>
        </div>
      </SectionWrapper>

      {/* 6. Showcase Section */}
      <SectionWrapper scrollSmooth={scrollSmooth} index={6} align="left">
        <div style={{ maxWidth: '900px', width: '100%' }}>
          <h2 className="section-title" style={{ textAlign: 'left', display: 'block', width: '100%' }}>{PORTFOLIO_DATA.showcase.title}</h2>
          <p style={{ textAlign: 'left', color: 'var(--text-secondary)', marginBottom: '3rem' }}>{PORTFOLIO_DATA.showcase.description}</p>
          <div className="showcase-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {PORTFOLIO_DATA.showcase.sites.map((site) => (
              <div key={site.id} className="service-card glass" style={{ minHeight: '260px', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--accent-cyan)' }}>{site.name}</h3>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>{site.role}</p>
                  <div className="project-tags">
                    {site.technologies.map((tech) => (
                      <span key={tech} className="tag tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
                <a 
                  href={site.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="project-link" 
                  style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem', width: '100%' }}
                >
                  Visit Showcase &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 7. Contact Section */}
      <SectionWrapper scrollSmooth={scrollSmooth} index={7} align="left">
        <div className="contact-section" style={{ maxWidth: '650px', width: '100%', padding: 0 }}>
          <div className="glass" style={{ padding: '3.5rem 2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <span className="reply-time">{PORTFOLIO_DATA.contact.availability}</span>
              <span className="reply-time">{PORTFOLIO_DATA.contact.replyTime}</span>
            </div>
            <h2 className="contact-headline">{PORTFOLIO_DATA.contact.headline}</h2>
            <p style={{ margin: '0 0 2.5rem', maxWidth: '480px' }}>{PORTFOLIO_DATA.contact.text}</p>
            <div className="contact-cta-group">
              <a href={PORTFOLIO_DATA.contact.primaryCta.href} className="cta-button">
                {PORTFOLIO_DATA.contact.primaryCta.text}
              </a>
              <a href={PORTFOLIO_DATA.contact.secondaryCta.href} className="cta-button cta-secondary">
                {PORTFOLIO_DATA.contact.secondaryCta.text}
              </a>
            </div>
          </div>

          {/* Footer inside Contact section overlay */}
          <footer className="portfolio-footer" style={{ border: 'none', background: 'transparent', marginTop: '4rem', padding: '2rem 0' }}>
            <div className="portfolio-footer-inner" style={{ padding: 0 }}>
              <div className="footer-brand">{PORTFOLIO_DATA.header.logo}</div>
              <div className="footer-links">
                <a href="#services" onClick={(e) => handleCtaClick(e, 2)}>Services</a>
                <a href="#process" onClick={(e) => handleCtaClick(e, 3)}>Process</a>
                <a href="#work" onClick={(e) => handleCtaClick(e, 4)}>Work</a>
                <Link to="/showcase">Showcase</Link>
              </div>
              <div className="footer-copy" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                &copy; {new Date().getFullYear()} {PORTFOLIO_DATA.header.logo} All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </SectionWrapper>
    </div>
  );
}
