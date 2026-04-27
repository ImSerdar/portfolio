import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './EcommerceDemo.module.css';

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

const EcommerceDemo = () => {
  const [activeColor, setActiveColor] = useState(0);
  const vpRef = useRef(null);
  useScrollReveal(vpRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const products = [
    { id: 1, name: "Aura Pro", price: "$999", tag: "Most powerful", image: "/aura_pro.png" },
    { id: 2, name: "Aura Air", price: "$599", tag: "Ultra-light", image: "/aura_air.png" },
    { id: 3, name: "Aura Mini", price: "$399", tag: "Compact", image: "/aura_mini.png" }
  ];

  const colors = ["#1d1d1f", "#f5f5f7", "#bf8040", "#4a6741"];
  const colorNames = ["Midnight", "Starlight", "Gold", "Forest"];

  const reviews = [
    { name: "Alex K.", stars: 5, text: "The Aura Pro completely transformed how I work. Battery lasts all day and the display is unreal.", product: "Aura Pro" },
    { name: "Sarah M.", stars: 5, text: "Lightest device I've ever owned. I take it everywhere without thinking twice.", product: "Aura Air" },
    { name: "James R.", stars: 4, text: "Perfect for my desk setup. Compact but doesn't compromise on performance.", product: "Aura Mini" },
    { name: "Priya L.", stars: 5, text: "Switched from a competitor and never looked back. The ecosystem is seamless.", product: "Aura Pro" }
  ];

  const accessories = [
    { name: "Aura Keyboard", price: "$199", desc: "Magic keys with Touch ID", image: "/aura_keyboard.png" },
    { name: "Aura Display", price: "$1,599", desc: "27-inch 5K Retina", image: "/aura_display.png" },
    { name: "Aura Trackpad", price: "$149", desc: "Force Touch surface", image: "/aura_trackpad.png" },
    { name: "Aura Charger", price: "$49", desc: "35W Dual USB-C", image: "/aura_charger.png" }
  ];

  return (
    <div className={styles.viewport} ref={vpRef}>
      <Link to="/" className={styles.backBadge}>&#8592; Back to Portfolio</Link>

      <div className={styles.appView}>
        {/* Navigation */}
        <nav className={styles.nav}>
          <div className={styles.logo}>Aura</div>
          <div className={styles.links}>
            <span>AuraBooks</span>
            <span>AuraPads</span>
            <span>AuraPhones</span>
            <span>AuraTime</span>
            <span>AuraBuds</span>
            <span>Gear</span>
          </div>
          <div className={styles.navActions}>
            <span className={styles.navIcon}>&#x1F50D;</span>
            <span className={styles.navIcon}>&#x1F6D2;</span>
          </div>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <h1>Pro everywhere.</h1>
          <p>The most advanced technology in a minimalist form factor.</p>
          <div className={styles.heroActions}>
            <button className={styles.heroBtn}>Learn more</button>
            <button className={styles.heroBtnOutline}>Buy &gt;</button>
          </div>
        </header>

        {/* Featured Product Spotlight */}
        <section className={styles.spotlight}>
          <div className={styles.spotlightInner}>
            <div className={styles.spotlightVisual}>
              <div className={styles.deviceFrame}>
                <div className={styles.deviceScreen}></div>
              </div>
            </div>
            <div className={styles.spotlightContent}>
              <span className={styles.newBadge}>New</span>
              <h2>Aura Pro</h2>
              <p className={styles.spotlightTagline}>Mind-blowing. Head-turning.</p>
              <ul className={styles.specList}>
                <li><span className={styles.specLabel}>Chip</span><span className={styles.specValue}>A18 Ultra</span></li>
                <li><span className={styles.specLabel}>Battery</span><span className={styles.specValue}>24-hour</span></li>
                <li><span className={styles.specLabel}>Display</span><span className={styles.specValue}>16" Liquid Retina XDR</span></li>
                <li><span className={styles.specLabel}>Memory</span><span className={styles.specValue}>Up to 128GB</span></li>
              </ul>
              <div className={styles.colorPicker}>
                {colors.map((c, i) => (
                  <button
                    key={i}
                    className={`${styles.colorDot} ${activeColor === i ? styles.colorDotActive : ''}`}
                    style={{ background: c }}
                    onClick={() => setActiveColor(i)}
                    aria-label={colorNames[i]}
                  />
                ))}
                <span className={styles.colorName}>{colorNames[activeColor]}</span>
              </div>
              <div className={styles.spotlightPrice}>From $999</div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className={styles.productSection}>
          <h2 className={styles.sectionTitle}>Explore the lineup.</h2>
          <div className={styles.productGrid}>
            {products.map((item) => (
              <div key={item.id} className={styles.productCard}>
                <span className={styles.productTag}>{item.tag}</span>
                <div className={styles.imageContainer}>
                  <img src={item.image} alt={item.name} className={styles.productImage} />
                </div>
                <h3>{item.name}</h3>
                <div className={styles.price}>From {item.price}</div>
                <button className={styles.btn}>Buy Now</button>
                <button className={styles.btnLink}>Learn more &gt;</button>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Banner */}
        <section className={styles.comparisonBanner}>
          <h2>Which Aura is right for you?</h2>
          <div className={styles.comparisonGrid}>
            <div className={styles.comparisonCol}>
              <div className={styles.comparisonThumb}>
                <img src="/aura_pro.png" alt="Aura Pro" style={{width: '100%', height: '100%', objectFit: 'contain', padding: '10px'}} />
              </div>
              <h4>Aura Pro</h4>
              <p>For demanding professional workflows</p>
              <ul>
                <li>A18 Ultra chip</li>
                <li>Up to 128GB memory</li>
                <li>24-hour battery</li>
              </ul>
            </div>
            <div className={styles.comparisonCol}>
              <div className={styles.comparisonThumb}>
                <img src="/aura_air.png" alt="Aura Air" style={{width: '100%', height: '100%', objectFit: 'contain', padding: '10px'}} />
              </div>
              <h4>Aura Air</h4>
              <p>For effortless mobility every day</p>
              <ul>
                <li>A18 Pro chip</li>
                <li>Up to 32GB memory</li>
                <li>18-hour battery</li>
              </ul>
            </div>
            <div className={styles.comparisonCol}>
              <div className={styles.comparisonThumb}>
                <img src="/aura_mini.png" alt="Aura Mini" style={{width: '100%', height: '100%', objectFit: 'contain', padding: '10px'}} />
              </div>
              <h4>Aura Mini</h4>
              <p>For a powerful compact desktop</p>
              <ul>
                <li>A18 chip</li>
                <li>Up to 32GB memory</li>
                <li>Tiny footprint</li>
              </ul>
            </div>
          </div>
          <button className={styles.heroBtnOutline}>Compare all models</button>
        </section>

        {/* Promo Section */}
        <section className={styles.promoSection}>
          <h2>Unleash your creativity.</h2>
          <p>Get 3 months of Aura+ free when you buy any new Aura device.</p>
          <button className={styles.promoBtn}>Learn more</button>
        </section>

        {/* Reviews */}
        <section className={styles.reviewsSection}>
          <h2 className={styles.sectionTitle}>What people are saying.</h2>
          <div className={styles.reviewsGrid}>
            {reviews.map((r, i) => (
              <div key={i} className={styles.reviewCard}>
                <div className={styles.stars}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
                <p className={styles.reviewText}>&ldquo;{r.text}&rdquo;</p>
                <div className={styles.reviewAuthor}>
                  <span className={styles.reviewName}>{r.name}</span>
                  <span className={styles.reviewProduct}>{r.product}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Accessories */}
        <section className={styles.accessoriesSection}>
          <h2 className={styles.sectionTitle}>Accessories.</h2>
          <p className={styles.sectionSub}>Complete your setup with everything you need.</p>
          <div className={styles.accessoriesGrid}>
            {accessories.map((a, i) => (
              <div key={i} className={styles.accessoryCard}>
                <div className={styles.accessoryThumb}>
                  <img src={a.image} alt={a.name} style={{width: '100%', height: '100%', objectFit: 'contain', padding: '10px'}} />
                </div>
                <h4>{a.name}</h4>
                <p>{a.desc}</p>
                <span className={styles.accessoryPrice}>{a.price}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Trade-in */}
        <section className={styles.tradeIn}>
          <div className={styles.tradeInContent}>
            <h2>Trade in your current device.</h2>
            <p>Get credit toward a new Aura when you trade in an eligible device. It's good for you and the planet.</p>
            <button className={styles.heroBtnOutline}>Get your estimate</button>
          </div>
        </section>

        {/* Newsletter */}
        <section className={styles.newsletter}>
          <h3>Stay in the loop.</h3>
          <p>Get the latest news, announcements, and product releases from Aura.</p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="Enter your email" className={styles.emailInput} />
            <button className={styles.btn}>Sign Up</button>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div>
              <h5>Shop and Learn</h5>
              <ul>
                <li>AuraBooks</li>
                <li>AuraPads</li>
                <li>AuraPhones</li>
                <li>AuraTime</li>
                <li>Gear</li>
              </ul>
            </div>
            <div>
              <h5>Services</h5>
              <ul>
                <li>Aura+</li>
                <li>Aura Music</li>
                <li>Aura TV</li>
                <li>Aura Care</li>
              </ul>
            </div>
            <div>
              <h5>Account</h5>
              <ul>
                <li>Manage Your Account</li>
                <li>Aura Store Account</li>
                <li>iCloud.com</li>
              </ul>
            </div>
            <div>
              <h5>About Aura</h5>
              <ul>
                <li>Newsroom</li>
                <li>Leadership</li>
                <li>Investors</li>
                <li>Ethics & Compliance</li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <div>Copyright &copy; 2026 Aura Inc. All rights reserved.</div>
            <div className={styles.footerLinks}>
              <span>Privacy Policy</span>
              <span>Terms of Use</span>
              <span>Sales and Refunds</span>
              <span>Site Map</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EcommerceDemo;
