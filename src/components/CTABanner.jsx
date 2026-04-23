import React, { useEffect, useRef } from 'react';

const CTABanner = ({ data }) => {
  const ref = useRef(null);

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
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="cta-banner" ref={ref} style={{ opacity: 0 }}>
      <div className="cta-banner-inner">
        <div className="cta-banner-text">
          <h2>{data.headline}</h2>
          <p>{data.subtext}</p>
        </div>
        <a href={data.button.href} className="cta-button cta-banner-btn">
          {data.button.text} &rarr;
        </a>
      </div>
    </section>
  );
};

export default CTABanner;
