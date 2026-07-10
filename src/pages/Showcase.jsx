import React, { useEffect } from 'react';
import DeviceMockup from '../components/DeviceMockup';

const Showcase = ({ data }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="showcase-page">
      <section className="showcase-header">
        <h1 className="section-title animate-on-load">{data.title}</h1>
        <p className="showcase-description animate-on-load" style={{ animationDelay: '0.2s' }}>
          {data.description}
        </p>
      </section>

      <div className="showcase-projects">
        {data.sites.map((site, index) => (
          <section key={site.id} className="showcase-item glass">
            <div className="showcase-item-info">
              <h2>{site.name}</h2>
              <span className="tag showcase-role">{site.role}</span>
              
              {site.technologies && (
                <div className="project-tags" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {site.technologies.map(tech => (
                    <span key={tech} className="tag">{tech}</span>
                  ))}
                </div>
              )}

              <a href={site.url} target="_blank" rel="noreferrer" className="project-link showcase-link">
                Visit Live Content
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
            
            <DeviceMockup url={site.url} name={site.name} />
          </section>
        ))}
      </div>
    </main>
  );
};

export default Showcase;
