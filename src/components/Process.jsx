import React, { useEffect, useRef } from 'react';

const Process = ({ data }) => {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);

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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('card-reveal');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    stepsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [data.steps]);

  return (
    <section id="process" ref={sectionRef} style={{ opacity: 0 }}>
      <h2 className="section-title">{data.title}</h2>
      {data.subtitle && <p className="process-subtitle">{data.subtitle}</p>}
      <div className="process-grid">
        {data.steps.map((step, i) => (
          <div
            key={step.id}
            className="process-step card-hidden"
            ref={(el) => (stepsRef.current[i] = el)}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="process-number">{step.id}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Process;
