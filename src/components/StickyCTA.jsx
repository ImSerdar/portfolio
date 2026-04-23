import React, { useEffect, useState } from 'react';

const StickyCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.8;
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 300;
      setVisible(window.scrollY > threshold && !nearBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <a
      href="/#contact"
      className={`sticky-cta ${visible ? 'sticky-cta-visible' : ''}`}
      aria-label="Contact Serdar"
    >
      Let's Talk &rarr;
    </a>
  );
};

export default StickyCTA;
