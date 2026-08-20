import React, { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield,
  Brain,
  Bell,
  Activity,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingDown,
  ChevronRight,
  BarChart3,
  Sliders,
  Check,
  Compass,
  FileText,
  Bookmark
} from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

export default function Landing() {
  const featuresRef = React.useRef(null)
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-60px" })

  // Interactive Live Demo preview states in Hero
  const [activeDemoRisk, setActiveDemoRisk] = useState('Low')
  const [demoAttendance, setDemoAttendance] = useState(94)
  const [demoGpa, setDemoGpa] = useState(8.6)

  const demoRadar = [
    { subject: 'Attendance', A: demoAttendance },
    { subject: 'GPA', A: (demoGpa / 10) * 100 },
    { subject: 'Assignments', A: activeDemoRisk === 'High' ? 45 : 92 },
    { subject: 'LMS Logins', A: activeDemoRisk === 'High' ? 30 : 88 },
    { subject: 'Wellbeing', A: activeDemoRisk === 'High' ? 40 : 85 },
    { subject: 'Social Hub', A: activeDemoRisk === 'High' ? 35 : 80 },
  ]

  const featureCards = [
    {
      code: 'SYS-01',
      icon: '🧠',
      tag: '[ ENSEMBLE CLASSIFIER ]',
      title: 'Multivariate Risk Classification',
      desc: 'Dual-pipeline model combining RandomForest with XGBoost across 12 behavioral and academic vectors to detect early disengagement.'
    },
    {
      code: 'SYS-02',
      icon: '⚡',
      tag: '[ WEBSOCKET TELEMETRY ]',
      title: 'Sub-Second Alert Pipeline',
      desc: 'Automated event triggers broadcast real-time escalation notices to department advisors whenever attendance momentum or assessment scores dip.'
    },
    {
      code: 'SYS-03',
      icon: '🎯',
      tag: '[ SHAP EXPLAINABILITY ]',
      title: 'Prescriptive Action Plans',
      desc: 'Transparent Shapley factor attributions tell mentors exactly why a student is flagged, pairing alerts with targeted remedial tutoring or counseling.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg)',
      minHeight: '100dvh',
      color: 'var(--ink)',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Top Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--topbar-height)',
        backgroundColor: 'rgba(245, 240, 232, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '2px solid var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            backgroundColor: 'var(--ink)',
            color: 'var(--bg)',
            borderRadius: 'var(--radius-xs)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 700
          }}>
            🛡️
          </div>
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: '28px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            EduGuard
          </span>
          <span className="stamp-badge" style={{ borderColor: 'var(--ink)', color: 'var(--ink)', marginLeft: '6px' }}>
            v2.6 SIH
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" style={{
            backgroundColor: 'var(--ink)',
            color: 'var(--bg)',
            height: '38px',
            padding: '0 20px',
            border: '2px solid var(--ink)',
            boxShadow: '3px 3px 0px var(--accent)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'all 0.15s ease'
          }}>
            Sign In →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '120px 24px 64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '920px' }}
        >
          {/* Eyebrow Stamp */}
          <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
            <span className="stamp-badge" style={{
              fontSize: '12px',
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--ink)',
              color: 'var(--ink)',
              padding: '4px 14px',
              boxShadow: '2px 2px 0px var(--ink)'
            }}>
              /* PROACTIVE RETENTION ENGINE · WEEKS 2 TO 6 CRITICAL WINDOW */
            </span>
          </motion.div>

          {/* Handwritten Main Headline */}
          <motion.h1 variants={itemVariants} style={{
            fontSize: 'clamp(44px, 6vw, 76px)',
            fontWeight: 700,
            color: 'var(--ink)',
            lineHeight: 1.02,
            margin: '0 0 16px 0',
            fontFamily: 'var(--font-hand)'
          }}>
            Catch dropout risk before it becomes dropout reality.
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={itemVariants} style={{
            fontSize: 'clamp(15px, 1.8vw, 17px)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            maxWidth: '680px',
            lineHeight: 1.5,
            margin: '0 0 32px 0'
          }}>
            EduGuard unites 12 academic, LMS, and mental wellbeing signals to alert mentors early, complete with transparent SHAP explainability and What-If recovery simulations.
          </motion.p>

          {/* Primary CTA Buttons */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
            <Link to="/login" style={{
              backgroundColor: 'var(--ink)',
              color: 'var(--bg)',
              height: '46px',
              padding: '0 28px',
              border: '2px solid var(--ink)',
              boxShadow: '4px 4px 0px var(--accent)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none'
            }}>
              Launch Platform Demo <ArrowRight size={16} />
            </Link>

            <Link to="/predict" style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--ink)',
              height: '46px',
              padding: '0 24px',
              border: '2px solid var(--ink)',
              boxShadow: '4px 4px 0px var(--ink)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}>
              <Sliders size={16} /> Open What-If Studio
            </Link>
          </motion.div>

          {/* Interactive Hand-Drawn Telemetry Simulator Card */}
          <motion.div
            variants={itemVariants}
            className="hand-drawn-card"
            style={{
              width: '100%',
              maxWidth: '860px',
              padding: '28px',
              textAlign: 'left',
              marginBottom: '32px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--ink)', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <div className="stamp-badge" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', marginBottom: '4px' }}>
                  [ LIVE RECOVERY SIMULATOR ]
                </div>
                <h3 style={{ fontSize: '18px', color: 'var(--ink)', margin: 0 }}>
                  Simulate Student Risk & Telemetry
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['Low', 'Medium', 'High'].map(tier => (
                  <button
                    key={tier}
                    onClick={() => {
                      setActiveDemoRisk(tier)
                      if (tier === 'High') { setDemoAttendance(52); setDemoGpa(4.8) }
                      else if (tier === 'Medium') { setDemoAttendance(72); setDemoGpa(6.8) }
                      else { setDemoAttendance(94); setDemoGpa(8.6) }
                    }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-xs)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: '1.5px solid var(--ink)',
                      background: activeDemoRisk === tier ? 'var(--ink)' : 'var(--surface)',
                      color: activeDemoRisk === tier ? 'var(--bg)' : 'var(--ink)',
                      boxShadow: activeDemoRisk === tier ? '2px 2px 0px var(--accent)' : 'none'
                    }}
                  >
                    {tier} Tier
                  </button>
                ))}
              </div>
            </div>

            {/* Simulator Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
              {/* Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <span>ATTENDANCE MOMENTUM</span>
                    <span style={{ color: demoAttendance < 75 ? 'var(--danger)' : 'var(--success)' }}>{demoAttendance}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={demoAttendance}
                    onChange={e => setDemoAttendance(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--ink)', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <span>CUMULATIVE GPA</span>
                    <span style={{ color: demoGpa < 6.0 ? 'var(--danger)' : 'var(--success)' }}>{demoGpa.toFixed(1)} / 10.0</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="10.0"
                    step="0.1"
                    value={demoGpa}
                    onChange={e => setDemoGpa(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--ink)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ background: 'var(--surface-2)', padding: '12px 14px', border: '1.5px solid var(--ink)', borderRadius: 'var(--radius-xs)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '2px' }}>
                    SIMULATED OUTCOME:
                  </div>
                  <div style={{ color: demoAttendance < 70 ? 'var(--danger)' : 'var(--success)' }}>
                    {demoAttendance < 70
                      ? '⚠️ High Risk Warning — Proactive Mentorship & Tutoring Protocol Triggered.'
                      : '✓ Safe Standing — Student on Track for On-Time Graduation.'}
                  </div>
                </div>
              </div>

              {/* Mini Radar Visualizer */}
              <div style={{ height: '220px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={demoRadar}>
                    <PolarGrid stroke="var(--ink)" strokeDasharray="3 3" opacity={0.3} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--ink)', fontSize: 10, fontFamily: 'Space Mono' }} />
                    <Radar name="Student Profile" dataKey="A" stroke="var(--ink)" fill="var(--accent)" fillOpacity={0.35} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Blueprint Telemetry Strip */}
      <section style={{
        backgroundColor: 'var(--surface-2)',
        borderTop: '2px solid var(--ink)',
        borderBottom: '2px solid var(--ink)',
        padding: '36px 24px'
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: '44px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
              5,000+
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              [ STUDENTS MONITORED ]
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: '44px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
              92.4%
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              [ ENSEMBLE MODEL ACCURACY ]
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: '44px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
              Weeks 2–6
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              [ EARLY DETECTION WINDOW ]
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: '44px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
              &lt; 50ms
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              [ LIVE WEBSOCKET LATENCY ]
            </div>
          </div>
        </div>
      </section>

      {/* Sketched Bento Grid */}
      <section ref={featuresRef} style={{ padding: '80px 24px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="stamp-badge" style={{ borderColor: 'var(--ink)', color: 'var(--ink)', marginBottom: '8px' }}>
            [ ARCHITECTURAL CAPABILITIES ]
          </span>
          <h2 style={{ fontSize: '42px', color: 'var(--ink)', margin: '8px 0 0' }}>
            Engineered for High-Precision Intervention
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {featureCards.map((card, idx) => (
            <motion.div
              key={idx}
              className={idx % 2 === 0 ? 'hand-drawn-card' : 'hand-drawn-card-alt'}
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>{card.icon}</span>
                <span className="stamp-badge" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  {card.code}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>
                {card.tag}
              </div>
              <h3 style={{ fontSize: '16px', color: 'var(--ink)', marginBottom: '10px' }}>
                {card.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: 'var(--surface)',
        borderTop: '2px solid var(--ink)',
        padding: '32px 24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>
            EduGuard
          </span>
          <span className="stamp-badge" style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}>
            SIH 2026
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Autonomous Early-Warning Student Retention Intelligence System · Built for Smart India Hackathon
        </p>
      </footer>
    </div>
  )
}
