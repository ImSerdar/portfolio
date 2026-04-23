import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './FitnessDemo.module.css';

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

// Activity ring component (Apple Watch style)
const ActivityRing = ({ percent, color, radius, stroke }) => {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <>
      <circle
        stroke="rgba(255,255,255,0.08)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={160}
        cy={160}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={160}
        cy={160}
        style={{
          transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: 'rotate(-90deg)',
          transformOrigin: '160px 160px'
        }}
      />
    </>
  );
};

// Mini sparkline
const Sparkline = ({ data, color }) => {
  const width = 80;
  const height = 28;
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
    <svg width={width} height={height} className={styles.sparkline}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const FitnessDemo = () => {
  const vpRef = useRef(null);
  const [tab, setTab] = useState('today');
  useScrollReveal(vpRef);

  useEffect(() => {
    if (vpRef.current) vpRef.current.scrollTo(0, 0);
  }, []);

  const metrics = [
    { label: 'Steps', value: '8,432', goal: 'of 10,000', color: '#7CFF6B', icon: '👟', spark: [4, 6, 5, 8, 7, 9, 8] },
    { label: 'Calories', value: '2,140', goal: 'kcal burned', color: '#FF6B35', icon: '🔥', spark: [3, 4, 6, 5, 7, 8, 7] },
    { label: 'Heart Rate', value: '72', goal: 'avg bpm', color: '#FF6BB5', icon: '❤', spark: [70, 74, 71, 80, 76, 72, 73] },
    { label: 'Sleep', value: '7h 24m', goal: 'last night', color: '#9B6BFF', icon: '🌙', spark: [6, 7, 6, 8, 7, 7, 8] }
  ];

  const weekData = [
    { day: 'M', steps: 7200 },
    { day: 'T', steps: 9100 },
    { day: 'W', steps: 6500 },
    { day: 'T', steps: 10200 },
    { day: 'F', steps: 8800 },
    { day: 'S', steps: 12400 },
    { day: 'S', steps: 8432 }
  ];
  const maxSteps = Math.max(...weekData.map((d) => d.steps));

  const workouts = [
    { type: 'Run', emoji: '🏃', title: 'Morning Run', detail: '5.2 km · 28:14 · 412 kcal', time: 'Today, 6:45 AM', color: '#7CFF6B' },
    { type: 'HIIT', emoji: '⚡', title: 'HIIT Session', detail: '32 min · 380 kcal · Avg 148 bpm', time: 'Yesterday, 7:20 PM', color: '#FF6B35' },
    { type: 'Yoga', emoji: '🧘', title: 'Vinyasa Flow', detail: '45 min · 180 kcal · Recovery', time: 'Yesterday, 6:00 AM', color: '#9B6BFF' },
    { type: 'Bike', emoji: '🚴', title: 'Indoor Cycling', detail: '40 min · 12.4 km · 540 kcal', time: '2 days ago', color: '#6BB5FF' },
    { type: 'Swim', emoji: '🏊', title: 'Pool Laps', detail: '1.5 km · 38 min · 320 kcal', time: '3 days ago', color: '#6BFFE6' }
  ];

  const goals = [
    { label: 'Weekly Distance', current: 28.4, target: 40, unit: 'km', color: '#7CFF6B' },
    { label: 'Active Minutes', current: 312, target: 450, unit: 'min', color: '#FF6B35' },
    { label: 'Workouts', current: 4, target: 6, unit: 'sessions', color: '#9B6BFF' }
  ];

  const friends = [
    { rank: 1, name: 'Maya R.', initials: 'MR', steps: 14820, gain: '+1,420', avatar: '#FF6BB5' },
    { rank: 2, name: 'Jordan T.', initials: 'JT', steps: 12450, gain: '+940', avatar: '#7CFF6B' },
    { rank: 3, name: 'You', initials: 'AL', steps: 8432, gain: '+312', avatar: '#FFB700', isYou: true },
    { rank: 4, name: 'Chris D.', initials: 'CD', steps: 7980, gain: '+180', avatar: '#9B6BFF' },
    { rank: 5, name: 'Priya N.', initials: 'PN', steps: 6420, gain: '+72', avatar: '#6BB5FF' }
  ];

  return (
    <div className={styles.viewport} ref={vpRef}>
      <Link to="/" className={styles.backBadge}>&#8592; Back to Portfolio</Link>

      <div className={styles.appView}>
        {/* Top nav */}
        <nav className={styles.topNav}>
          <div className={styles.topNavLeft}>
            <div className={styles.greeting}>Good morning,</div>
            <div className={styles.userName}>Alex Lin <span className={styles.wave}>👋</span></div>
          </div>
          <div className={styles.topNavRight}>
            <div className={styles.datePill}>Mon · Apr 19</div>
            <div className={styles.avatar}>AL</div>
          </div>
        </nav>

        {/* Hero — activity rings */}
        <section className={styles.heroRings}>
          <div className={styles.ringsVisual}>
            <svg width="320" height="320" className={styles.ringsSvg}>
              <ActivityRing percent={78} color="#7CFF6B" radius={150} stroke={18} />
              <ActivityRing percent={62} color="#FF6B35" radius={120} stroke={18} />
              <ActivityRing percent={91} color="#FF6BB5" radius={90} stroke={18} />
            </svg>
            <div className={styles.ringsCenter}>
              <div className={styles.ringsPercent}>78<span>%</span></div>
              <div className={styles.ringsLabel}>Daily Goal</div>
            </div>
          </div>
          <div className={styles.ringsLegend}>
            <h1 className={styles.heroTitle}>You're crushing it today.</h1>
            <p className={styles.heroSub}>3 of 4 daily targets within reach. Keep moving.</p>
            <div className={styles.legendList}>
              <div className={styles.legendRow}>
                <span className={styles.legendDot} style={{ background: '#7CFF6B' }} />
                <span className={styles.legendLabel}>Move</span>
                <span className={styles.legendVal}>412 / 530 kcal</span>
              </div>
              <div className={styles.legendRow}>
                <span className={styles.legendDot} style={{ background: '#FF6B35' }} />
                <span className={styles.legendLabel}>Exercise</span>
                <span className={styles.legendVal}>18 / 30 min</span>
              </div>
              <div className={styles.legendRow}>
                <span className={styles.legendDot} style={{ background: '#FF6BB5' }} />
                <span className={styles.legendLabel}>Stand</span>
                <span className={styles.legendVal}>11 / 12 hrs</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab switcher */}
        <section className={styles.tabRow}>
          {['today', 'week', 'month', 'year'].map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </section>

        {/* Today's metrics */}
        <section className={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <div key={i} className={styles.metricCard} style={{ '--accent': m.color }}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>{m.icon}</div>
                <Sparkline data={m.spark} color={m.color} />
              </div>
              <div className={styles.metricValue}>{m.value}</div>
              <div className={styles.metricMeta}>
                <span className={styles.metricLabel}>{m.label}</span>
                <span className={styles.metricGoal}>{m.goal}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Weekly progress chart */}
        <section className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Weekly Activity</h2>
              <p className={styles.chartSub}>62,632 steps this week · +12% vs last</p>
            </div>
            <div className={styles.chartLegend}>
              <span className={styles.chartLegendDot} /> Steps
            </div>
          </div>
          <div className={styles.barChart}>
            {weekData.map((d, i) => {
              const heightPct = (d.steps / maxSteps) * 100;
              const isToday = i === weekData.length - 1;
              return (
                <div key={i} className={styles.barCol}>
                  <div className={styles.barWrap}>
                    <div
                      className={`${styles.bar} ${isToday ? styles.barToday : ''}`}
                      style={{ height: `${heightPct}%`, transitionDelay: `${i * 80}ms` }}
                    >
                      <div className={styles.barTooltip}>{d.steps.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className={`${styles.barDay} ${isToday ? styles.barDayToday : ''}`}>{d.day}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent workouts feed */}
        <section className={styles.workoutsSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recent Workouts</h2>
            <button className={styles.seeAll}>See all &rarr;</button>
          </div>
          <div className={styles.workoutsList}>
            {workouts.map((w, i) => (
              <div key={i} className={styles.workoutRow}>
                <div className={styles.workoutEmoji} style={{ background: `${w.color}22`, color: w.color }}>
                  {w.emoji}
                </div>
                <div className={styles.workoutBody}>
                  <div className={styles.workoutTop}>
                    <span className={styles.workoutTitle}>{w.title}</span>
                    <span className={styles.workoutTag} style={{ color: w.color, borderColor: `${w.color}55` }}>
                      {w.type}
                    </span>
                  </div>
                  <div className={styles.workoutDetail}>{w.detail}</div>
                  <div className={styles.workoutTime}>{w.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Streak + goals */}
        <section className={styles.streakSection}>
          <div className={styles.streakCard}>
            <div className={styles.streakBadge}>🔥</div>
            <div className={styles.streakNum}>12</div>
            <div className={styles.streakLabel}>Day Streak</div>
            <p className={styles.streakBlurb}>Longest streak this year. Don't break the chain.</p>
            <div className={styles.streakDots}>
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className={styles.streakDot} />
              ))}
            </div>
          </div>
          <div className={styles.goalsCard}>
            <h3 className={styles.goalsTitle}>Weekly Goals</h3>
            {goals.map((g, i) => {
              const pct = Math.min((g.current / g.target) * 100, 100);
              return (
                <div key={i} className={styles.goalRow}>
                  <div className={styles.goalLabel}>
                    <span>{g.label}</span>
                    <span className={styles.goalNums}>
                      {g.current} / {g.target} {g.unit}
                    </span>
                  </div>
                  <div className={styles.goalTrack}>
                    <div
                      className={styles.goalFill}
                      style={{
                        width: `${pct}%`,
                        background: g.color,
                        transitionDelay: `${i * 120}ms`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Leaderboard */}
        <section className={styles.leaderSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Friends Leaderboard</h2>
            <span className={styles.leaderMeta}>This week</span>
          </div>
          <div className={styles.leaderList}>
            {friends.map((f) => (
              <div
                key={f.rank}
                className={`${styles.leaderRow} ${f.isYou ? styles.leaderYou : ''}`}
              >
                <div className={styles.leaderRank}>{f.rank}</div>
                <div className={styles.leaderAvatar} style={{ background: f.avatar }}>
                  {f.initials}
                </div>
                <div className={styles.leaderName}>{f.name}</div>
                <div className={styles.leaderSteps}>{f.steps.toLocaleString()}</div>
                <div className={styles.leaderGain}>{f.gain}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h3>Start a workout</h3>
          <p>Pick up where you left off — your AI coach is ready when you are.</p>
          <div className={styles.ctaButtons}>
            <button className={styles.ctaPrimary}>Begin Session &rarr;</button>
            <button className={styles.ctaGhost}>Browse plans</button>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <span className={styles.footerLogo}>PULSE</span>
              <span className={styles.footerTagline}>Move better. Daily.</span>
            </div>
            <div className={styles.footerStack}>
              <span>React Native</span>
              <span>·</span>
              <span>GraphQL</span>
              <span>·</span>
              <span>HealthKit</span>
            </div>
          </div>
          <div className={styles.footerBottom}>
            &copy; 2026 Pulse Health Co. · Built as a demo for Serdar's portfolio.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FitnessDemo;
