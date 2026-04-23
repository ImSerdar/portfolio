import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './CorporateDemo.module.css';

const useScrollReveal = (viewportRef) => {
  useEffect(() => {
    if (!viewportRef.current) return;
    const vp = viewportRef.current;
    const sections = vp.querySelectorAll('section, footer');

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

const CorporateDemo = () => {
  const [billingCycle, setBillingCycle] = useState('annual');
  const vpRef = useRef(null);
  useScrollReveal(vpRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { title: "SOC-2 Compliant", desc: "Enterprise-grade security standards baked directly into the core infrastructure, keeping your data protected.", icon: "&#128274;" },
    { title: "Real-time Syncing", desc: "Bidirectional data hooks ensure your entire organization is operating on exactly the same dataset without lag.", icon: "&#128260;" },
    { title: "Advanced Analytics", desc: "Customizable dashboards with deep machine learning insights that track your most valuable metrics.", icon: "&#128200;" }
  ];

  const stats = [
    { value: "10K+", label: "Companies worldwide" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "2.4M", label: "Daily active users" },
    { value: "150+", label: "Countries served" }
  ];

  const plans = [
    {
      name: "Starter",
      price: billingCycle === 'annual' ? 29 : 35,
      desc: "For small teams getting started",
      features: ["Up to 10 users", "5GB storage", "Basic analytics", "Email support", "API access"],
      cta: "Start Free Trial",
      highlighted: false
    },
    {
      name: "Professional",
      price: billingCycle === 'annual' ? 79 : 99,
      desc: "For growing businesses that need more",
      features: ["Up to 50 users", "100GB storage", "Advanced analytics", "Priority support", "API access", "Custom integrations", "SSO / SAML"],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: null,
      desc: "For large organizations at scale",
      features: ["Unlimited users", "Unlimited storage", "Custom analytics", "24/7 dedicated support", "Advanced API", "Custom integrations", "SSO / SAML", "On-premise option", "SLA guarantee"],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  const testimonials = [
    { quote: "EnterpriseSync transformed our team collaboration. We shipped 40% faster in Q1.", author: "Maria Chen", role: "VP of Engineering", company: "Stratos Inc." },
    { quote: "The analytics alone paid for the subscription within the first month.", author: "James Okafor", role: "Head of Data", company: "NovaBridge" },
    { quote: "Best enterprise tool we've adopted in years. Onboarding was seamless.", author: "Lena Petrov", role: "COO", company: "Meridian Group" }
  ];

  const integrations = [
    "Slack", "GitHub", "Jira", "Notion", "Figma", "AWS", "Salesforce", "HubSpot"
  ];

  return (
    <div className={styles.viewport} ref={vpRef}>
      <Link to="/" className={styles.backBadge}>&#8592; Back to Portfolio</Link>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}></div>
          EnterpriseSync
        </div>
        <nav className={styles.navLinks}>
          <span>Products</span>
          <span>Solutions</span>
          <span>Pricing</span>
          <span>Resources</span>
        </nav>
        <div className={styles.headerActions}>
          <button className={styles.btnGhost}>Sign In</button>
          <button className={styles.btnPrimary}>Start Free Trial</button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.badge}>v2.0 Now Available</div>
          <h1>Streamline your corporate workflow at scale.</h1>
          <p>The ultimate collaboration engine for modern enterprises. Unify your data, align your teams, and accelerate time-to-market.</p>
          <div className={styles.ctaGroup}>
            <button className={styles.btnPrimary} style={{ padding: '14px 32px', fontSize: '16px' }}>Get Started Free</button>
            <button className={styles.btnSecondary}>Watch Demo</button>
          </div>
          <div className={styles.heroSocial}>Trusted by 10,000+ companies worldwide</div>
        </section>

        {/* Logo Bar */}
        <section className={styles.logoBar}>
          {["TechCorp", "Synapse", "Vortex", "Helix", "Axiom"].map((name, i) => (
            <div key={i} className={styles.logoBarItem}>{name}</div>
          ))}
        </section>

        {/* Stats */}
        <section className={styles.statsSection}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </section>

        {/* Features */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresSectionHeader}>
            <h2>Everything you need to move faster.</h2>
            <p>Built for teams that demand reliability, security, and speed.</p>
          </div>
          <div className={styles.features}>
            {features.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon} dangerouslySetInnerHTML={{ __html: f.icon }}></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Highlight */}
        <section className={styles.featureHighlight}>
          <div className={styles.highlightContent}>
            <span className={styles.badge}>Analytics</span>
            <h2>Insights that drive decisions.</h2>
            <p>Our advanced analytics engine processes millions of data points in real time, surfacing the metrics that matter most to your business. From custom dashboards to automated reports, see everything at a glance.</p>
            <ul className={styles.highlightList}>
              <li>Real-time data processing pipeline</li>
              <li>Custom dashboard builder with drag-and-drop</li>
              <li>Automated weekly and monthly reports</li>
              <li>ML-powered anomaly detection</li>
            </ul>
          </div>
          <div className={styles.highlightVisual}>
            <div className={styles.dashboardMockup}>
              <div className={styles.mockupBar}></div>
              <div className={styles.mockupContent}>
                <div className={styles.mockupChart}></div>
                <div className={styles.mockupRows}>
                  <div className={styles.mockupRow}></div>
                  <div className={styles.mockupRow}></div>
                  <div className={styles.mockupRow}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className={styles.integrationsSection}>
          <h2>Works with the tools you already use.</h2>
          <p>Connect EnterpriseSync to your existing stack in minutes, not months.</p>
          <div className={styles.integrationsGrid}>
            {integrations.map((name, i) => (
              <div key={i} className={styles.integrationCard}>
                <div className={styles.integrationIcon}></div>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className={styles.pricingSection}>
          <h2>Simple, transparent pricing.</h2>
          <p>No hidden fees. No surprises. Cancel anytime.</p>
          <div className={styles.billingToggle}>
            <button
              className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.toggleActive : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`${styles.toggleBtn} ${billingCycle === 'annual' ? styles.toggleActive : ''}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual
              <span className={styles.saveBadge}>Save 20%</span>
            </button>
          </div>
          <div className={styles.pricingGrid}>
            {plans.map((plan, i) => (
              <div key={i} className={`${styles.pricingCard} ${plan.highlighted ? styles.pricingHighlighted : ''}`}>
                {plan.highlighted && <div className={styles.popularBadge}>Most Popular</div>}
                <h3>{plan.name}</h3>
                <p className={styles.planDesc}>{plan.desc}</p>
                <div className={styles.planPrice}>
                  {plan.price !== null ? (
                    <>
                      <span className={styles.priceCurrency}>$</span>
                      <span className={styles.priceAmount}>{plan.price}</span>
                      <span className={styles.pricePeriod}>/ user / mo</span>
                    </>
                  ) : (
                    <span className={styles.priceCustom}>Custom</span>
                  )}
                </div>
                <button className={plan.highlighted ? styles.btnPrimary : styles.btnSecondary} style={{ width: '100%', padding: '12px' }}>
                  {plan.cta}
                </button>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className={styles.testimonialsSection}>
          <h2>Loved by teams everywhere.</h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}></div>
                  <div>
                    <div className={styles.authorName}>{t.author}</div>
                    <div className={styles.authorRole}>{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <h2>Ready to transform your workflow?</h2>
          <p>Join 10,000+ companies already using EnterpriseSync to collaborate better.</p>
          <div className={styles.ctaGroup}>
            <button className={styles.ctaSectionBtn}>Get Started Free</button>
            <button className={styles.ctaSectionBtnOutline}>Talk to Sales</button>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div>
              <div className={styles.footerLogo}>
                <div className={styles.logoIcon}></div>
                EnterpriseSync
              </div>
              <p className={styles.footerTagline}>The modern enterprise collaboration platform.</p>
            </div>
            <div>
              <h5>Product</h5>
              <ul>
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
                <li>Changelog</li>
              </ul>
            </div>
            <div>
              <h5>Company</h5>
              <ul>
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
            <div>
              <h5>Resources</h5>
              <ul>
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Status</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h5>Legal</h5>
              <ul>
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
                <li>GDPR</li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>&copy; 2026 EnterpriseSync. All rights reserved.</span>
            <div className={styles.footerSocial}>
              <span>Twitter</span>
              <span>LinkedIn</span>
              <span>GitHub</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default CorporateDemo;
