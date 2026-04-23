import React from 'react';

const TECH = [
  "React", "JavaScript", "Node.js", "Python", "CSS", "HTML",
  "Git", "REST APIs", "Vite", "Automation", "Responsive Design", "SEO"
];

const Marquee = () => {
  const items = [...TECH, ...TECH];

  return (
    <section className="marquee-section">
      <div className="marquee-track">
        <div className="marquee-content">
          {items.map((tech, i) => (
            <span key={i} className="marquee-item">{tech}</span>
          ))}
        </div>
        <div className="marquee-content" aria-hidden="true">
          {items.map((tech, i) => (
            <span key={`dup-${i}`} className="marquee-item">{tech}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Marquee;
