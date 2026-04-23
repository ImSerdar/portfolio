import React, { useEffect, useRef } from 'react';

const Hero = ({ data }) => {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-load');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="hero-glow"></div>
      <div className="hero-layout" ref={heroRef}>
        <div className="hero-content">
          {data.badge && (
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              {data.badge}
            </div>
          )}
          <h1>{data.headline}</h1>
          <p>{data.tagline}</p>
          <div className="hero-cta-group">
            <a href={data.primaryCta?.href || data.ctaLink} className="cta-button">
              {data.primaryCta?.text || data.ctaText}
            </a>
            {data.secondaryCta && (
              <a href={data.secondaryCta.href} className="cta-button cta-secondary">
                {data.secondaryCta.text}
              </a>
            )}
          </div>
        </div>
        {data.image && (
          <div className="hero-image-wrapper">
            <img src={data.image} alt="Hero Abstract" className="hero-image" />
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
