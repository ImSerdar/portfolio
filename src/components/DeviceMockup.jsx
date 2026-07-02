import React, { useState, useRef, useEffect } from 'react';

const LAPTOP_WIDTH = 1920;
const LAPTOP_HEIGHT = 1200;
const MOBILE_WIDTH = 390;
const MOBILE_HEIGHT = 844;

const DeviceMockup = ({ url, name }) => {
  const [iframeError, setIframeError] = useState(false);
  const laptopContainerRef = useRef(null);
  const mobileContainerRef = useRef(null);
  const [laptopScale, setLaptopScale] = useState(null);
  const [mobileScale, setMobileScale] = useState(null);

  const handleIframeError = () => {
    setIframeError(true);
  };

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (entry.target === laptopContainerRef.current) {
          setLaptopScale(width / LAPTOP_WIDTH);
        } else if (entry.target === mobileContainerRef.current) {
          setMobileScale(width / MOBILE_WIDTH);
        }
      }
    });

    if (laptopContainerRef.current) observer.observe(laptopContainerRef.current);
    if (mobileContainerRef.current) observer.observe(mobileContainerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="device-showcase-container">
      {/* Laptop Mockup */}
      <div className="mockup-laptop">
        <div className="mockup-laptop-screen">
          <div className="browser-bar">
            <span></span><span></span><span></span>
            <div className="browser-url">{url}</div>
          </div>
          <div className="iframe-container" ref={laptopContainerRef}>
            {iframeError ? (
              <div className="iframe-fallback">
                <span>{name} Preview currently unavailable via iframe.
                <br /> <a href={url} target="_blank" rel="noreferrer">Visit Live Site</a></span>
              </div>
            ) : (
              <iframe
                src={url}
                title={`${name} Laptop Preview`}
                onError={handleIframeError}
                sandbox="allow-scripts allow-same-origin"
                style={{
                  width: LAPTOP_WIDTH,
                  height: LAPTOP_HEIGHT,
                  border: 'none',
                  transform: laptopScale !== null ? `scale(${laptopScale})` : undefined,
                  transformOrigin: 'top left',
                  visibility: laptopScale !== null ? 'visible' : 'hidden',
                }}
              />
            )}
          </div>
        </div>
        <div className="mockup-laptop-base"></div>
      </div>

      {/* Mobile Mockup */}
      <div className="mockup-mobile">
        <div className="mockup-mobile-screen">
          <div className="iframe-container" ref={mobileContainerRef}>
            {!iframeError && (
              <iframe
                src={url}
                title={`${name} Mobile Preview`}
                sandbox="allow-scripts allow-same-origin"
                style={{
                  width: MOBILE_WIDTH,
                  height: MOBILE_HEIGHT,
                  border: 'none',
                  transform: mobileScale !== null ? `scale(${mobileScale})` : undefined,
                  transformOrigin: 'top left',
                  visibility: mobileScale !== null ? 'visible' : 'hidden',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceMockup;
