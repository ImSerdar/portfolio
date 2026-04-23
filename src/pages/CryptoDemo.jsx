import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './CryptoDemo.module.css';

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

// Tiny inline sparkline for watchlist
const Sparkline = ({ data, color, width = 80, height = 24 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
};

// Candlestick chart
const Candlestick = ({ candles, width = 720, height = 320 }) => {
  const padding = { top: 12, right: 60, bottom: 12, left: 12 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const candleW = (innerWidth / candles.length) * 0.62;

  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const yMax = Math.max(...allPrices);
  const yMin = Math.min(...allPrices);
  const yRange = yMax - yMin || 1;
  const yScale = (v) => padding.top + ((yMax - v) / yRange) * innerHeight;
  const xScale = (i) => padding.left + (i + 0.5) * (innerWidth / candles.length);

  // Y-axis ticks
  const ticks = 5;
  const tickValues = Array.from({ length: ticks }, (_, i) => yMin + (yRange * i) / (ticks - 1));

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg}>
      {/* Grid lines */}
      {tickValues.map((v, i) => (
        <line
          key={i}
          x1={padding.left}
          x2={width - padding.right}
          y1={yScale(v)}
          y2={yScale(v)}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
      ))}
      {/* Y-axis labels */}
      {tickValues.map((v, i) => (
        <text
          key={`l${i}`}
          x={width - padding.right + 8}
          y={yScale(v) + 4}
          fill="rgba(255,255,255,0.45)"
          fontSize="10"
          fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        >
          {v.toFixed(0)}
        </text>
      ))}
      {/* Candles */}
      {candles.map((c, i) => {
        const x = xScale(i);
        const isUp = c.close >= c.open;
        const color = isUp ? '#26D962' : '#FF4D5A';
        const bodyTop = yScale(Math.max(c.open, c.close));
        const bodyBot = yScale(Math.min(c.open, c.close));
        const bodyHeight = Math.max(bodyBot - bodyTop, 1);
        return (
          <g key={i}>
            <line
              x1={x}
              x2={x}
              y1={yScale(c.high)}
              y2={yScale(c.low)}
              stroke={color}
              strokeWidth="1"
            />
            <rect
              x={x - candleW / 2}
              y={bodyTop}
              width={candleW}
              height={bodyHeight}
              fill={color}
              opacity={isUp ? 0.85 : 0.85}
            />
          </g>
        );
      })}
    </svg>
  );
};

const CryptoDemo = () => {
  const vpRef = useRef(null);
  const [pair, setPair] = useState('BTC/USD');
  const [timeframe, setTimeframe] = useState('1H');
  const [tradeSide, setTradeSide] = useState('buy');
  const [orderType, setOrderType] = useState('limit');
  const [livePrice, setLivePrice] = useState(67284.42);
  useScrollReveal(vpRef);

  useEffect(() => {
    if (vpRef.current) vpRef.current.scrollTo(0, 0);
  }, []);

  // Tick simulation
  useEffect(() => {
    const id = setInterval(() => {
      setLivePrice((p) => {
        const drift = (Math.random() - 0.5) * 18;
        return Math.max(60000, p + drift);
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Generate stable candles
  const candles = React.useMemo(() => {
    const out = [];
    let p = 66200;
    for (let i = 0; i < 48; i++) {
      const open = p;
      const change = (Math.sin(i / 3) + Math.cos(i / 2.3) + (Math.random() - 0.5) * 1.5) * 80;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 60;
      const low = Math.min(open, close) - Math.random() * 60;
      out.push({ open, close, high, low });
      p = close;
    }
    return out;
  }, []);

  const tickers = [
    { sym: 'BTC', price: '67,284.42', change: '+2.31%', up: true },
    { sym: 'ETH', price: '3,421.18', change: '+1.82%', up: true },
    { sym: 'SOL', price: '184.62', change: '-0.74%', up: false },
    { sym: 'ADA', price: '0.4821', change: '+4.12%', up: true },
    { sym: 'AVAX', price: '38.91', change: '-1.24%', up: false },
    { sym: 'DOT', price: '7.32', change: '+0.48%', up: true },
    { sym: 'LINK', price: '18.94', change: '+3.21%', up: true },
    { sym: 'MATIC', price: '0.7184', change: '-2.08%', up: false },
    { sym: 'ATOM', price: '11.42', change: '+1.04%', up: true },
    { sym: 'NEAR', price: '6.18', change: '-0.62%', up: false }
  ];

  const bids = [
    { price: 67280.50, size: 0.4821, total: 32450 },
    { price: 67278.20, size: 1.2104, total: 81490 },
    { price: 67275.10, size: 0.0921, total: 6196 },
    { price: 67272.80, size: 2.4821, total: 167080 },
    { price: 67270.40, size: 0.6214, total: 41805 },
    { price: 67268.90, size: 1.0421, total: 70112 },
    { price: 67265.20, size: 0.3214, total: 21620 },
    { price: 67262.10, size: 4.1240, total: 277441 }
  ];

  const asks = [
    { price: 67288.10, size: 0.2814, total: 18936 },
    { price: 67290.40, size: 1.4214, total: 95604 },
    { price: 67292.80, size: 0.6821, total: 45891 },
    { price: 67295.20, size: 2.1410, total: 144052 },
    { price: 67298.90, size: 0.4221, total: 28406 },
    { price: 67301.50, size: 1.8214, total: 122601 },
    { price: 67304.10, size: 0.7821, total: 52646 },
    { price: 67308.40, size: 3.2410, total: 218228 }
  ];

  const positions = [
    { pair: 'BTC/USD', side: 'LONG', size: '0.421', entry: '66,142.20', mark: '67,284.42', pnl: '+481.04', pct: '+1.72%', up: true },
    { pair: 'ETH/USD', side: 'LONG', size: '4.20', entry: '3,318.50', mark: '3,421.18', pnl: '+431.26', pct: '+3.09%', up: true },
    { pair: 'SOL/USD', side: 'SHORT', size: '12.0', entry: '188.20', mark: '184.62', pnl: '+42.96', pct: '+1.90%', up: true },
    { pair: 'AVAX/USD', side: 'LONG', size: '50.0', entry: '40.80', mark: '38.91', pnl: '-94.50', pct: '-4.63%', up: false },
    { pair: 'LINK/USD', side: 'LONG', size: '180.0', entry: '17.40', mark: '18.94', pnl: '+277.20', pct: '+8.85%', up: true }
  ];

  const watchlist = [
    { sym: 'BTC', name: 'Bitcoin', price: '67,284.42', change: '+2.31%', up: true, spark: [62, 63, 65, 64, 66, 65, 67, 67] },
    { sym: 'ETH', name: 'Ethereum', price: '3,421.18', change: '+1.82%', up: true, spark: [33, 34, 33, 34, 35, 34, 34, 34] },
    { sym: 'SOL', name: 'Solana', price: '184.62', change: '-0.74%', up: false, spark: [188, 187, 186, 184, 185, 184, 184, 184] },
    { sym: 'ADA', name: 'Cardano', price: '0.4821', change: '+4.12%', up: true, spark: [0.45, 0.46, 0.47, 0.46, 0.47, 0.48, 0.48, 0.48] },
    { sym: 'AVAX', name: 'Avalanche', price: '38.91', change: '-1.24%', up: false, spark: [40, 39, 39, 38, 39, 38, 39, 38] },
    { sym: 'DOT', name: 'Polkadot', price: '7.32', change: '+0.48%', up: true, spark: [7.1, 7.2, 7.3, 7.2, 7.3, 7.3, 7.3, 7.3] }
  ];

  const news = [
    { title: 'Spot Bitcoin ETF inflows hit record $2.4B as institutions accelerate Q2 allocation.', source: 'Reuters', time: '2m ago' },
    { title: 'Ethereum core devs greenlight Pectra upgrade for staged April-May rollout.', source: 'Decrypt', time: '14m ago' },
    { title: 'Solana DeFi TVL crosses $8B milestone, leading L1 weekly gainers.', source: 'CoinDesk', time: '38m ago' },
    { title: 'Fed minutes signal patient stance — risk assets rally across all majors.', source: 'Bloomberg', time: '1h ago' }
  ];

  return (
    <div className={styles.viewport} ref={vpRef}>
      <Link to="/" className={styles.backBadge}>&#8592; Back to Portfolio</Link>

      <div className={styles.appView}>
        {/* Top Nav */}
        <nav className={styles.topNav}>
          <div className={styles.navLeft}>
            <div className={styles.logo}>
              <span className={styles.logoMark}>◈</span>
              <span className={styles.logoText}>NEXUS<span>·</span>TERMINAL</span>
            </div>
            <div className={styles.navLinks}>
              <span className={styles.navLinkActive}>Trade</span>
              <span className={styles.navLink}>Markets</span>
              <span className={styles.navLink}>Portfolio</span>
              <span className={styles.navLink}>Earn</span>
              <span className={styles.navLink}>API</span>
            </div>
          </div>
          <div className={styles.navRight}>
            <div className={styles.balance}>
              <span className={styles.balanceLabel}>Portfolio</span>
              <span className={styles.balanceValue}>$84,231.40</span>
              <span className={styles.balanceChange}>+$1,902.18 (+2.31%)</span>
            </div>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>⌕</span>
              <input className={styles.searchInput} placeholder="Search markets..." />
            </div>
            <div className={styles.connDot} title="Connected">
              <span /> LIVE
            </div>
          </div>
        </nav>

        {/* Ticker Strip */}
        <section className={styles.tickerStrip}>
          <div className={styles.tickerInner}>
            {[...tickers, ...tickers].map((t, i) => (
              <div key={i} className={styles.tickerItem}>
                <span className={styles.tickerSym}>{t.sym}</span>
                <span className={styles.tickerPrice}>${t.price}</span>
                <span className={`${styles.tickerChange} ${t.up ? styles.up : styles.down}`}>
                  {t.change}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Main Chart */}
        <section className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <div className={styles.pairInfo}>
              <button
                className={styles.pairButton}
                onClick={() => setPair(pair === 'BTC/USD' ? 'ETH/USD' : 'BTC/USD')}
              >
                <span className={styles.pairName}>{pair}</span>
                <span className={styles.pairChevron}>▾</span>
              </button>
              <div className={styles.priceBlock}>
                <span className={styles.livePrice}>${livePrice.toFixed(2)}</span>
                <span className={styles.priceChange}>+1,142.22 (+1.72%)</span>
              </div>
            </div>
            <div className={styles.timeframes}>
              {['1m', '15m', '1H', '4H', '1D', '1W'].map((tf) => (
                <button
                  key={tf}
                  className={`${styles.tfButton} ${timeframe === tf ? styles.tfActive : ''}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className={styles.chartTools}>
              <span className={styles.toolBtn}>+ Indicator</span>
              <span className={styles.toolBtn}>⛶</span>
            </div>
          </div>
          <div className={styles.chartCanvas}>
            <Candlestick candles={candles} />
          </div>
          <div className={styles.chartFooter}>
            <div className={styles.metric}>
              <span>24h Vol</span>
              <strong>$28.4B</strong>
            </div>
            <div className={styles.metric}>
              <span>24h High</span>
              <strong className={styles.up}>$67,820.10</strong>
            </div>
            <div className={styles.metric}>
              <span>24h Low</span>
              <strong className={styles.down}>$65,940.20</strong>
            </div>
            <div className={styles.metric}>
              <span>Open Interest</span>
              <strong>$18.2B</strong>
            </div>
            <div className={styles.metric}>
              <span>Funding</span>
              <strong className={styles.up}>+0.0124%</strong>
            </div>
          </div>
        </section>

        {/* Order Book + Trade Panel Row */}
        <section className={styles.bookTradeRow}>
          {/* Order Book */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3>Order Book</h3>
              <div className={styles.bookGroup}>
                <span className={styles.bookOpt}>0.1</span>
                <span className={styles.bookOptActive}>1.0</span>
                <span className={styles.bookOpt}>10</span>
              </div>
            </div>
            <div className={styles.bookGrid}>
              <div className={styles.bookLabels}>
                <span>Price (USD)</span>
                <span>Size (BTC)</span>
                <span>Total</span>
              </div>
              <div className={styles.asksList}>
                {asks.slice().reverse().map((a, i) => {
                  const fill = (a.size / 5) * 100;
                  return (
                    <div key={i} className={styles.bookRow}>
                      <div className={styles.bookFill} style={{ width: `${fill}%`, background: 'rgba(255,77,90,0.08)' }} />
                      <span className={styles.bookPrice + ' ' + styles.down}>{a.price.toLocaleString()}</span>
                      <span className={styles.bookSize}>{a.size.toFixed(4)}</span>
                      <span className={styles.bookTotal}>{a.total.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.spreadRow}>
                <span className={styles.spreadLabel}>Spread</span>
                <span className={styles.spreadVal}>7.60</span>
                <span className={styles.spreadPct}>0.011%</span>
              </div>
              <div className={styles.bidsList}>
                {bids.map((b, i) => {
                  const fill = (b.size / 5) * 100;
                  return (
                    <div key={i} className={styles.bookRow}>
                      <div className={styles.bookFill} style={{ width: `${fill}%`, background: 'rgba(38,217,98,0.08)' }} />
                      <span className={styles.bookPrice + ' ' + styles.up}>{b.price.toLocaleString()}</span>
                      <span className={styles.bookSize}>{b.size.toFixed(4)}</span>
                      <span className={styles.bookTotal}>{b.total.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trade Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3>Place Order</h3>
              <span className={styles.balancePill}>Avail: $12,481.20</span>
            </div>
            <div className={styles.tradeTabs}>
              <button
                className={`${styles.sideBtn} ${tradeSide === 'buy' ? styles.sideBtnBuy : ''}`}
                onClick={() => setTradeSide('buy')}
              >
                Buy / Long
              </button>
              <button
                className={`${styles.sideBtn} ${tradeSide === 'sell' ? styles.sideBtnSell : ''}`}
                onClick={() => setTradeSide('sell')}
              >
                Sell / Short
              </button>
            </div>
            <div className={styles.orderTypeRow}>
              {['market', 'limit', 'stop'].map((t) => (
                <button
                  key={t}
                  className={`${styles.typeBtn} ${orderType === t ? styles.typeActive : ''}`}
                  onClick={() => setOrderType(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className={styles.formRow}>
              <label>Price</label>
              <div className={styles.inputWrap}>
                <input className={styles.formInput} defaultValue="67,284.42" />
                <span className={styles.inputSuffix}>USD</span>
              </div>
            </div>
            <div className={styles.formRow}>
              <label>Amount</label>
              <div className={styles.inputWrap}>
                <input className={styles.formInput} defaultValue="0.1842" />
                <span className={styles.inputSuffix}>BTC</span>
              </div>
            </div>
            <div className={styles.percentRow}>
              {[25, 50, 75, 100].map((p) => (
                <button key={p} className={styles.pctBtn}>
                  {p}%
                </button>
              ))}
            </div>
            <div className={styles.formRow}>
              <label>Total</label>
              <div className={styles.inputWrap}>
                <input className={styles.formInput} defaultValue="12,395.78" />
                <span className={styles.inputSuffix}>USD</span>
              </div>
            </div>
            <div className={styles.leverageRow}>
              <div className={styles.leverageLabel}>
                <span>Leverage</span>
                <strong className={styles.leverageVal}>10×</strong>
              </div>
              <input type="range" min="1" max="50" defaultValue="10" className={styles.slider} />
              <div className={styles.leverageMarks}>
                <span>1×</span>
                <span>10×</span>
                <span>25×</span>
                <span>50×</span>
              </div>
            </div>
            <button
              className={`${styles.submitBtn} ${tradeSide === 'buy' ? styles.submitBuy : styles.submitSell}`}
            >
              {tradeSide === 'buy' ? 'Buy / Long BTC' : 'Sell / Short BTC'}
            </button>
            <div className={styles.tradeInfo}>
              <div>
                <span>Margin</span>
                <strong>1,239.58 USD</strong>
              </div>
              <div>
                <span>Liq. Price</span>
                <strong className={styles.down}>61,428.20</strong>
              </div>
              <div>
                <span>Fee (0.04%)</span>
                <strong>4.96 USD</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Open Positions</h3>
            <div className={styles.tabsInline}>
              <span className={styles.tabActiveInline}>Positions (5)</span>
              <span className={styles.tabInline}>Open Orders (12)</span>
              <span className={styles.tabInline}>Order History</span>
              <span className={styles.tabInline}>Trade History</span>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Side</th>
                  <th>Size</th>
                  <th>Entry</th>
                  <th>Mark</th>
                  <th>PnL (USD)</th>
                  <th>ROI</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => (
                  <tr key={i}>
                    <td className={styles.tdBold}>{p.pair}</td>
                    <td>
                      <span className={p.side === 'LONG' ? styles.sideLong : styles.sideShort}>
                        {p.side}
                      </span>
                    </td>
                    <td>{p.size}</td>
                    <td>{p.entry}</td>
                    <td>{p.mark}</td>
                    <td className={p.up ? styles.up : styles.down}>{p.pnl}</td>
                    <td className={p.up ? styles.up : styles.down}>{p.pct}</td>
                    <td>
                      <button className={styles.closeBtn}>Close</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Watchlist + News */}
        <section className={styles.bottomRow}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3>Watchlist</h3>
              <span className={styles.linkText}>+ Add</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Price</th>
                    <th>24h</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((w, i) => (
                    <tr key={i}>
                      <td>
                        <div className={styles.assetCell}>
                          <span className={styles.assetSym}>{w.sym}</span>
                          <span className={styles.assetName}>{w.name}</span>
                        </div>
                      </td>
                      <td className={styles.tdBold}>${w.price}</td>
                      <td className={w.up ? styles.up : styles.down}>{w.change}</td>
                      <td>
                        <Sparkline data={w.spark} color={w.up ? '#26D962' : '#FF4D5A'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3>News Feed</h3>
              <span className={styles.linkText}>All sources ▾</span>
            </div>
            <div className={styles.newsList}>
              {news.map((n, i) => (
                <div key={i} className={styles.newsItem}>
                  <div className={styles.newsTitle}>{n.title}</div>
                  <div className={styles.newsMeta}>
                    <span className={styles.newsSource}>{n.source}</span>
                    <span className={styles.newsTime}>{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.logoText}>NEXUS<span>·</span>TERMINAL</span>
            <span className={styles.footerNote}>Built on Vue 3 · WebSockets · Real-time L2 data</span>
          </div>
          <div className={styles.footerRight}>
            <span>API Status: <em className={styles.up}>Operational</em></span>
            <span>Latency: 12ms</span>
            <span>v4.18.2</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CryptoDemo;
