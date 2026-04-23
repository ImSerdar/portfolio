import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AgencyDemo.module.css';

const useScrollReveal = (viewportRef) => {
  useEffect(() => {
    if (!viewportRef.current) return;
    const vp = viewportRef.current;
    const sections = vp.querySelectorAll('section, nav, footer');

    sections.forEach((el) => el.classList.add(styles.revealTarget));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        });
      },
      { root: vp, threshold: 0.08 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [viewportRef]);
};

const AgencyDemo = () => {
  const vpRef = useRef(null);
  const [hoveredWork, setHoveredWork] = useState(null);
  useScrollReveal(vpRef);

  useEffect(() => {
    if (vpRef.current) vpRef.current.scrollTo(0, 0);
  }, []);

  const works = [
    { id: 1, name: 'OBSCURA', cat: 'Brand · Identity · Print', year: '2026', size: 'large', bg: '#2D4BFF', accent: '#F4F1EC' },
    { id: 2, name: 'NORTHERN', cat: 'Digital · Product', year: '2026', size: 'small', bg: '#0E0E0E', accent: '#FF5A1F' },
    { id: 3, name: 'KOJI/KOJI', cat: 'Motion · 3D', year: '2025', size: 'small', bg: '#FF5A1F', accent: '#0E0E0E' },
    { id: 4, name: 'VESTIGE', cat: 'Strategy · Brand', year: '2025', size: 'wide', bg: '#E8E0D0', accent: '#0E0E0E' },
    { id: 5, name: 'AETHER', cat: 'Web · Editorial', year: '2025', size: 'small', bg: '#0E0E0E', accent: '#2D4BFF' },
    { id: 6, name: 'PARALLEL', cat: 'Identity · Type', year: '2024', size: 'small', bg: '#2D4BFF', accent: '#F4F1EC' }
  ];

  const capabilities = [
    {
      label: 'Brand Identity',
      num: '01',
      items: ['Visual systems', 'Naming & verbal', 'Type design', 'Brand guidelines']
    },
    {
      label: 'Digital Product',
      num: '02',
      items: ['Web platforms', 'App design', 'Design systems', 'Front-end build']
    },
    {
      label: 'Motion & 3D',
      num: '03',
      items: ['Brand films', 'WebGL experiences', '3D direction', 'Interactive installs']
    },
    {
      label: 'Strategy',
      num: '04',
      items: ['Positioning', 'Audience research', 'Brand architecture', 'Naming workshops']
    }
  ];

  const clients = [
    'OBSCURA', 'NORTHERN.CO', 'KOJI/KOJI', 'VESTIGE',
    'AETHER LABS', 'PARALLEL', 'SOMA', 'FIELD STUDIES',
    'HALCYON', 'NIMBUS', 'OFFGRID', 'TERRA NOVA'
  ];

  const team = [
    { initials: 'YM', name: 'Yuki Marlowe', role: 'Founder & ECD', accent: '#2D4BFF' },
    { initials: 'TR', name: 'Tomasz Reyes', role: 'Design Director', accent: '#FF5A1F' },
    { initials: 'AD', name: 'Anaïs Dubois', role: 'Strategy Lead', accent: '#0E0E0E' },
    { initials: 'KO', name: 'Kenji Okafor', role: 'Tech Director', accent: '#2D4BFF' },
    { initials: 'IM', name: 'Imani Müller', role: 'Motion Lead', accent: '#FF5A1F' },
    { initials: 'SL', name: 'Sven Lindqvist', role: 'Studio Manager', accent: '#0E0E0E' }
  ];

  const awards = [
    { award: 'D&AD Wood Pencil', work: 'OBSCURA — Identity', year: '2026' },
    { award: 'Brand New — Notable', work: 'NORTHERN — Rebrand', year: '2026' },
    { award: 'Awwwards SOTD', work: 'AETHER — Editorial', year: '2025' },
    { award: 'TDC Type Excellence', work: 'PARALLEL — Display', year: '2025' },
    { award: 'FWA of the Day', work: 'KOJI/KOJI — WebGL', year: '2025' },
    { award: 'Type Directors Club', work: 'VESTIGE — Wordmark', year: '2024' }
  ];

  return (
    <div className={styles.viewport} ref={vpRef}>
      <Link to="/" className={styles.backBadge}>&#8592; Back to Portfolio</Link>

      <div className={styles.appView}>
        {/* Top nav */}
        <nav className={styles.topNav}>
          <div className={styles.wordmark}>
            STUDIO<span className={styles.wordmarkSlash}>//</span>KORE
          </div>
          <div className={styles.navLinks}>
            <span className={styles.navLink}>Work</span>
            <span className={styles.navLink}>About</span>
            <span className={styles.navLink}>Capabilities</span>
            <span className={styles.navLink}>Journal</span>
            <span className={styles.navLink}>Contact</span>
          </div>
          <div className={styles.navMeta}>
            <span className={styles.metaPill}>Est. 2018</span>
            <span className={styles.metaPill}>(2026)</span>
          </div>
        </nav>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              <span>Independent creative studio</span>
            </div>
            <h1 className={styles.heroDisplay}>
              We make brands<br />
              that <em>refuse</em><br />
              to be ignored.
            </h1>
            <p className={styles.heroLead}>
              An independent practice operating between strategy, identity, and digital craft.
              Vancouver · Tokyo · Berlin.
            </p>
            <div className={styles.heroCta}>
              <button className={styles.ctaPrimary}>
                <span>Start a project</span>
                <span className={styles.arrow}>→</span>
              </button>
              <button className={styles.ctaGhost}>View selected work</button>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.orb}>
              <div className={styles.orbInner} />
              <div className={styles.orbRing} />
              <div className={styles.orbRing2} />
            </div>
            <div className={styles.heroStat}>
              <div className={styles.statNum}>78</div>
              <div className={styles.statLabel}>Projects shipped<br />in last 24 months</div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {[...Array(2)].map((_, k) => (
              <div key={k} className={styles.marqueeGroup}>
                <span>★</span>
                <span>AVAILABLE Q3 2026</span>
                <span>★</span>
                <span>NEW WORK INCOMING</span>
                <span>★</span>
                <span>LIMITED PARTNERSHIPS</span>
                <span>★</span>
                <span>MAKE SOMETHING REAL</span>
                <span>★</span>
                <span>SINCE 2018</span>
              </div>
            ))}
          </div>
        </section>

        {/* Manifesto */}
        <section className={styles.manifesto}>
          <div className={styles.manifestoLeft}>
            <span className={styles.sectionNum}>(01)</span>
            <span className={styles.sectionLabel}>Manifesto</span>
          </div>
          <div className={styles.manifestoBody}>
            <p>
              Most brands settle for being seen. We build the kind that get
              <em> remembered</em>. The kind that earn space in your morning
              ritual, your group chat, your year-end list.
            </p>
            <p>
              That requires conviction — about who you are, who you're for, and
              what you refuse to compromise on. We help you find those three
              answers, then build everything else from there.
            </p>
            <div className={styles.signature}>— Yuki Marlowe, Founder</div>
          </div>
        </section>

        {/* Selected Work Grid */}
        <section className={styles.workSection}>
          <div className={styles.workHead}>
            <div>
              <span className={styles.sectionNum}>(02)</span>
              <span className={styles.sectionLabel}>Selected Work</span>
            </div>
            <span className={styles.workCount}>06 / 78</span>
          </div>
          <div className={styles.workGrid}>
            {works.map((w) => (
              <div
                key={w.id}
                className={`${styles.workTile} ${styles[w.size]}`}
                style={{ background: w.bg, color: w.accent }}
                onMouseEnter={() => setHoveredWork(w.id)}
                onMouseLeave={() => setHoveredWork(null)}
              >
                <div className={styles.workMeta}>
                  <span>{String(w.id).padStart(2, '0')}</span>
                  <span>{w.year}</span>
                </div>
                <div className={styles.workTitle}>{w.name}</div>
                <div className={styles.workCat}>{w.cat}</div>
                <div className={styles.workArrow}>
                  {hoveredWork === w.id ? 'View case →' : '↗'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Capabilities */}
        <section className={styles.capSection}>
          <div className={styles.capHead}>
            <div>
              <span className={styles.sectionNum}>(03)</span>
              <span className={styles.sectionLabel}>Capabilities</span>
            </div>
            <h2 className={styles.capTitle}>
              Four practices,<br />one studio.
            </h2>
          </div>
          <div className={styles.capGrid}>
            {capabilities.map((c) => (
              <div key={c.num} className={styles.capCol}>
                <div className={styles.capNum}>{c.num}</div>
                <h3 className={styles.capLabel}>{c.label}</h3>
                <ul className={styles.capList}>
                  {c.items.map((item, i) => (
                    <li key={i}>
                      <span className={styles.capBullet}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Client Wall */}
        <section className={styles.clientSection}>
          <div className={styles.clientHead}>
            <span className={styles.sectionNum}>(04)</span>
            <span className={styles.sectionLabel}>Trusted by</span>
          </div>
          <div className={styles.clientGrid}>
            {clients.map((c, i) => (
              <div key={i} className={styles.clientCell}>
                {c}
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className={styles.teamSection}>
          <div className={styles.teamHead}>
            <div>
              <span className={styles.sectionNum}>(05)</span>
              <span className={styles.sectionLabel}>The studio</span>
            </div>
            <p className={styles.teamLead}>
              Six people. No middle layer between you and the maker.
            </p>
          </div>
          <div className={styles.teamGrid}>
            {team.map((p, i) => (
              <div key={i} className={styles.teamCard}>
                <div className={styles.teamAvatar} style={{ background: p.accent }}>
                  {p.initials}
                </div>
                <div className={styles.teamInfo}>
                  <div className={styles.teamName}>{p.name}</div>
                  <div className={styles.teamRole}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Awards */}
        <section className={styles.awardSection}>
          <div className={styles.awardHead}>
            <div>
              <span className={styles.sectionNum}>(06)</span>
              <span className={styles.sectionLabel}>Recognition</span>
            </div>
          </div>
          <div className={styles.awardList}>
            {awards.map((a, i) => (
              <div key={i} className={styles.awardRow}>
                <div className={styles.awardYear}>{a.year}</div>
                <div className={styles.awardName}>{a.award}</div>
                <div className={styles.awardWork}>{a.work}</div>
                <div className={styles.awardArrow}>↗</div>
              </div>
            ))}
          </div>
        </section>

        {/* Big CTA */}
        <section className={styles.bigCta}>
          <div className={styles.bigCtaLabel}>
            <span className={styles.sectionNum}>(07)</span>
            <span className={styles.sectionLabel}>Get in touch</span>
          </div>
          <h2 className={styles.bigCtaText}>
            Let's make<br />
            something<br />
            <em>worth keeping.</em>
          </h2>
          <div className={styles.bigCtaActions}>
            <a href="#" className={styles.emailLink}>
              <span>hello@studiokore.com</span>
              <span className={styles.arrow}>→</span>
            </a>
            <div className={styles.bigCtaMeta}>
              <span>Currently booking · Q3 / Q4 2026</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.footerWordmark}>
              STUDIO<span className={styles.wordmarkSlash}>//</span>KORE
            </div>
            <div className={styles.footerCols}>
              <div className={styles.footerCol}>
                <h5>Studio</h5>
                <p>Vancouver</p>
                <p>Tokyo</p>
                <p>Berlin</p>
              </div>
              <div className={styles.footerCol}>
                <h5>Connect</h5>
                <p>Instagram</p>
                <p>Are.na</p>
                <p>Read.cv</p>
              </div>
              <div className={styles.footerCol}>
                <h5>Inquire</h5>
                <p>New projects</p>
                <p>Press</p>
                <p>Careers</p>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>Built with Three.js · GSAP · Care.</span>
            <span>© 2026 Studio Kore Pte. Ltd.</span>
            <span>(Demo for Serdar's portfolio)</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AgencyDemo;
