import React, { useEffect, useRef } from 'react';

const Contact = ({ data }) => {
  const sectionRef = useRef(null);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="contact-section" ref={sectionRef} style={{ opacity: 0 }}>
      <h2 className="section-title">{data.title}</h2>
      {data.headline && <h3 className="contact-headline">{data.headline}</h3>}
      <p>{data.text}</p>

      <div className="contact-cta-group">
        <a
          href={data.primaryCta?.href || `mailto:${data.email}`}
          className="cta-button"
        >
          {data.primaryCta?.text || "Email Me"}
        </a>
        {data.secondaryCta && (
          <a href={data.secondaryCta.href} className="cta-button cta-secondary">
            {data.secondaryCta.text}
          </a>
        )}
      </div>

      <div className="contact-meta">
        <div className="availability">
          {data.availability}
        </div>
        {data.replyTime && (
          <div className="reply-time">
            &#x2709; {data.replyTime}
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
