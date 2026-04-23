import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './WorkflowDemo.module.css';

const useScrollReveal = (viewportRef) => {
  useEffect(() => {
    if (!viewportRef.current) return;
    const vp = viewportRef.current;
    const panels = vp.querySelectorAll(`.${styles.panel}, .${styles.metricsRow}`);

    panels.forEach((el) => el.classList.add(styles.revealTarget));

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

    panels.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [viewportRef]);
};

const TERMINAL_LINES = [
  { ts: "14:32:01", text: "[SYS] Nexus Control v4.2.1 initialized", type: "sys" },
  { ts: "14:32:01", text: "[NET] Establishing encrypted tunnel to node cluster...", type: "net" },
  { ts: "14:32:02", text: "[NET] Tunnel established — latency 12ms", type: "net" },
  { ts: "14:32:03", text: "[SEC] Firewall rules synced — 2,847 active rules", type: "sec" },
  { ts: "14:32:04", text: "[SYS] CPU governor set to performance mode", type: "sys" },
  { ts: "14:32:05", text: "[NET] Incoming connection from 10.0.42.7 — AUTHORIZED", type: "net" },
  { ts: "14:32:06", text: "[SEC] Certificate rotation complete — next in 23h", type: "sec" },
  { ts: "14:32:07", text: "[SYS] Memory pool allocated: 64GB / 128GB", type: "sys" },
  { ts: "14:32:08", text: "[WAR] Node n-0847 response time elevated (340ms)", type: "warn" },
  { ts: "14:32:09", text: "[NET] Load balancer reweighted — traffic shifted", type: "net" },
  { ts: "14:32:10", text: "[SYS] Automated backup initiated — ETA 4m", type: "sys" },
  { ts: "14:32:11", text: "[SEC] Anomaly scan complete — 0 threats detected", type: "sec" },
];

const ACTIVITY_LOG = [
  { time: "2 min ago", user: "SYSTEM", action: "Auto-scaled cluster to 1,024 nodes", severity: "info" },
  { time: "5 min ago", user: "admin@nexus", action: "Updated firewall rule #2841", severity: "info" },
  { time: "12 min ago", user: "SYSTEM", action: "Node n-0847 flagged for elevated latency", severity: "warn" },
  { time: "18 min ago", user: "ops@nexus", action: "Deployed config patch v4.2.1-hotfix", severity: "info" },
  { time: "31 min ago", user: "SYSTEM", action: "Certificate rotation completed successfully", severity: "info" },
  { time: "45 min ago", user: "sec@nexus", action: "Blocked brute-force attempt from 192.168.4.12", severity: "alert" },
  { time: "1 hr ago", user: "SYSTEM", action: "Daily threat intelligence feed updated", severity: "info" },
  { time: "2 hr ago", user: "admin@nexus", action: "Enabled geo-fencing for EU region", severity: "info" },
];

const SECURITY_ALERTS = [
  { id: "SEC-4201", status: "resolved", title: "Brute-force login attempt", source: "192.168.4.12", time: "45m ago" },
  { id: "SEC-4200", status: "resolved", title: "Unusual outbound traffic spike", source: "Node n-0291", time: "3h ago" },
  { id: "SEC-4199", status: "monitoring", title: "Deprecated TLS version detected", source: "Edge proxy #7", time: "6h ago" },
  { id: "SEC-4198", status: "resolved", title: "Failed SSH authentication (3x)", source: "10.0.12.44", time: "8h ago" },
];

const WorkflowDemo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);
  const terminalRef = useRef(null);
  const vpRef = useRef(null);
  useScrollReveal(vpRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animate terminal lines
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        const line = TERMINAL_LINES[i];
        setTerminalLines(prev => [...prev, line]);
        i++;
      } else {
        i = 0;
        setTerminalLines([]);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const sidebarItems = [
    { label: "System Overview", icon: "◈" },
    { label: "Network Topology", icon: "◇" },
    { label: "Active Connections", icon: "◆" },
    { label: "Security Logs", icon: "◉" },
    { label: "Performance", icon: "◎" },
    { label: "Deployments", icon: "◐" },
  ];

  return (
    <div className={styles.viewport} ref={vpRef}>
      <Link to="/" className={styles.backBadge}>&#8592; BACK TO PORTFOLIO</Link>

      <div className={styles.appView}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>
            <span className={styles.logoGlyph}>&#9672;</span>
            <span>NEXUS</span>
          </div>
          {sidebarItems.map((item, i) => (
            <div
              key={i}
              className={`${styles.sidebarItem} ${activeTab === i ? styles.active : ''}`}
              onClick={() => setActiveTab(i)}
            >
              <span className={styles.sidebarIcon}>{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div className={styles.sidebarFooter}>
            <div className={styles.connectionDot}></div>
            <span>All systems nominal</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Header */}
          <header className={styles.header}>
            <div>
              <h1>Nexus Control</h1>
              <p>Real-time automation monitoring array</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.statusPill}>
                <span className={styles.statusDot}></span>
                LIVE
              </div>
              <span className={styles.headerTime}>14:32:11 UTC</span>
            </div>
          </header>

          {/* Metric Cards Row */}
          <div className={styles.metricsRow}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Active Nodes</span>
              <span className={styles.metricValue}>1,024</span>
              <span className={styles.metricDelta}>&#9650; 12 from last hour</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Requests / sec</span>
              <span className={styles.metricValue}>84.2K</span>
              <span className={styles.metricDelta}>&#9650; 3.1K from avg</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Avg Latency</span>
              <span className={styles.metricValue}>12ms</span>
              <span className={`${styles.metricDelta} ${styles.metricGood}`}>&#9660; 2ms from avg</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Uptime</span>
              <span className={styles.metricValue}>99.98%</span>
              <span className={styles.metricDelta}>342 days continuous</span>
            </div>
          </div>

          {/* Main Grid - Traffic + System Status */}
          <div className={styles.grid}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Traffic Analysis</h3>
                <div className={styles.panelTabs}>
                  <span className={styles.panelTabActive}>1H</span>
                  <span>6H</span>
                  <span>24H</span>
                  <span>7D</span>
                </div>
              </div>
              <div className={styles.graphPlaceholder}>
                <div className={styles.graphGrid}></div>
                <svg className={styles.graphSvg} viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ff" />
                      <stop offset="100%" stopColor="#f0f" />
                    </linearGradient>
                    <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(0,255,255,0.15)" />
                      <stop offset="100%" stopColor="rgba(0,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <path d="M0,160 Q50,140 100,120 T200,100 T300,60 T400,80 T500,40 T600,50" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
                  <path d="M0,160 Q50,140 100,120 T200,100 T300,60 T400,80 T500,40 T600,50 L600,200 L0,200 Z" fill="url(#fillGrad)" />
                </svg>
                <div className={styles.graphLabels}>
                  <span>14:00</span><span>14:10</span><span>14:20</span><span>14:30</span>
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <h3>System Status</h3>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>CPU Load</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '84%' }}></div>
                  </div>
                  <span className={styles.statValue}>84%</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Memory</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '62%', background: 'linear-gradient(90deg, #0f0, #0ff)' }}></div>
                  </div>
                  <span className={styles.statValue}>62%</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Disk I/O</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '45%', background: 'linear-gradient(90deg, #0ff, #80f)' }}></div>
                  </div>
                  <span className={styles.statValue}>45%</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Network</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '71%' }}></div>
                  </div>
                  <span className={styles.statValue}>71%</span>
                </div>
                <div className={styles.statItemFull}>
                  <span className={styles.statLabel}>Encryption Matrix</span>
                  <span className={`${styles.statValue} ${styles.statusValid}`}>&#10003; Valid</span>
                </div>
                <div className={styles.statItemFull}>
                  <span className={styles.statLabel}>Cluster Health</span>
                  <span className={`${styles.statValue} ${styles.statusValid}`}>&#10003; Healthy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>System Console</h3>
              <div className={styles.terminalDots}>
                <span style={{ background: '#f55' }}></span>
                <span style={{ background: '#fb0' }}></span>
                <span style={{ background: '#0d0' }}></span>
              </div>
            </div>
            <div className={styles.terminal} ref={terminalRef}>
              {terminalLines.map((line, i) => (
                <div key={i} className={`${styles.terminalLine} ${styles[`term_${line.type}`]}`}>
                  <span className={styles.termTs}>{line.ts}</span>
                  {line.text}
                </div>
              ))}
              <div className={styles.terminalCursor}>
                <span className={styles.termTs}>14:32:12</span>
                <span className={styles.cursorBlink}>_</span>
              </div>
            </div>
          </div>

          {/* Bottom Grid - Activity Log + Security Alerts */}
          <div className={styles.grid}>
            <div className={styles.panel}>
              <h3>Activity Log</h3>
              <div className={styles.activityList}>
                {ACTIVITY_LOG.map((entry, i) => (
                  <div key={i} className={styles.activityItem}>
                    <div className={`${styles.activityDot} ${styles[`sev_${entry.severity}`]}`}></div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityAction}>{entry.action}</div>
                      <div className={styles.activityMeta}>
                        <span>{entry.user}</span>
                        <span>{entry.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <h3>Security Alerts</h3>
              <div className={styles.alertsList}>
                {SECURITY_ALERTS.map((alert, i) => (
                  <div key={i} className={styles.alertItem}>
                    <div className={styles.alertHeader}>
                      <span className={styles.alertId}>{alert.id}</span>
                      <span className={`${styles.alertStatus} ${styles[`alertStatus_${alert.status}`]}`}>
                        {alert.status}
                      </span>
                    </div>
                    <div className={styles.alertTitle}>{alert.title}</div>
                    <div className={styles.alertMeta}>
                      <span>Source: {alert.source}</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Network Nodes Visualization */}
          <div className={styles.panel}>
            <h3>Network Topology</h3>
            <div className={styles.nodesGrid}>
              {Array.from({ length: 24 }, (_, i) => {
                const status = i === 7 ? 'warn' : i === 19 ? 'offline' : 'online';
                return (
                  <div key={i} className={`${styles.node} ${styles[`node_${status}`]}`}>
                    <div className={styles.nodeIcon}></div>
                    <span className={styles.nodeLabel}>n-{String(i + 1).padStart(4, '0')}</span>
                    <span className={styles.nodeStatus}>{status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkflowDemo;
