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
        <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', alignItems: 'center' }}>
          {data.badge && (
            <div className="hero-badge" style={{ alignSelf: 'center' }}>
              <span className="hero-badge-dot"></span>
              {data.badge}
            </div>
          )}
          <h1>
            {data.headline || <><span className="text-gradient">I solve</span><br/>technical problems.</>}
          </h1>
          <p style={{ margin: '0 auto 2.5rem auto' }}>{data.tagline}</p>
          <div className="hero-cta-group" style={{ justifyContent: 'center' }}>
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
      </div>
    </section>
  );
};

export default Hero;
