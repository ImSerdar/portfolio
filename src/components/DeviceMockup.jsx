import React, { useState } from 'react';

const DeviceMockup = ({ url, name }) => {
  const [iframeError, setIframeError] = useState(false);

  // Fallback visual if iframe gets blocked by X-Frame-Options
  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <div className="device-showcase-container">
      {/* Laptop Mockup */}
      <div className="mockup-laptop">
        <div className="mockup-laptop-screen">
          <div className="browser-bar">
            <span></span><span></span><span></span>
            <div className="browser-url">{url}</div>
          </div>
          <div className="iframe-container">
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
              />
            )}
          </div>
        </div>
        <div className="mockup-laptop-base"></div>
      </div>

      {/* Mobile Mockup */}
      <div className="mockup-mobile">
        <div className="mockup-mobile-screen">
          <div className="iframe-container">
            {!iframeError && (
              <iframe 
                src={url} 
                title={`${name} Mobile Preview`} 
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceMockup;
