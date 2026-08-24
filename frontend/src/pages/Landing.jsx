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
      code: '01',
      icon: '🧠',
      tag: 'ENSEMBLE CLASSIFIER',
      title: 'Multivariate Risk Classification',
      desc: 'Dual-pipeline model combining RandomForest with XGBoost across 12 behavioral and academic vectors to detect early disengagement.'
    },
    {
      code: '02',
      icon: '⚡',
      tag: 'WEBSOCKET TELEMETRY',
      title: 'Sub-Second Alert Pipeline',
      desc: 'Automated event triggers broadcast real-time escalation notices to department advisors whenever attendance momentum dips.'
    },
    {
      code: '03',
      icon: '🎯',
      tag: 'SHAP EXPLAINABILITY',
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
      color: 'var(--text-primary)',
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
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)',
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 700,
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
          }}>
            <Shield size={18} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            EduGuard
          </span>
          <span className="stamp-badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', marginLeft: '6px' }}>
            v2.6 SIH
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)',
            color: 'white',
            height: '38px',
            padding: '0 20px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)',
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
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '880px' }}
        >
          {/* Eyebrow Badge */}
          <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
            <span className="stamp-badge" style={{
              fontSize: '12px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              padding: '5px 16px',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            }}>
              <Sparkles size={13} style={{ marginRight: '4px' }} /> EARLY-WARNING RETENTION ENGINE · WEEKS 2 TO 6
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 variants={itemVariants} style={{
            fontSize: 'clamp(40px, 5.5vw, 64px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            margin: '0 0 16px 0'
          }}>
            Catch dropout risk before it becomes dropout reality.
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={itemVariants} style={{
            fontSize: 'clamp(16px, 1.8vw, 19px)',
            color: 'var(--text-secondary)',
            maxWidth: '660px',
            lineHeight: 1.55,
            margin: '0 0 36px 0'
          }}>
            EduGuard unites 12 academic, LMS, and mental wellbeing signals to alert mentors early, complete with transparent SHAP explainability and What-If recovery simulations.
          </motion.p>

          {/* Primary CTA Buttons */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
            <Link to="/login" style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)',
              color: 'white',
              height: '48px',
              padding: '0 28px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)',
              fontSize: '14.5px',
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
              color: 'var(--text-primary)',
              height: '48px',
              padding: '0 24px',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-sm)',
              borderRadius: 'var(--radius-full)',
              fontSize: '14.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}>
              <Sliders size={16} color="var(--accent)" /> Open What-If Studio
            </Link>
          </motion.div>

          {/* Interactive Telemetry Simulator Card */}
          <motion.div
            variants={itemVariants}
            className="premium-card"
            style={{
              width: '100%',
              maxWidth: '860px',
              padding: '28px',
              textAlign: 'left',
              marginBottom: '32px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div className="stamp-badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', marginBottom: '4px' }}>
                  LIVE RECOVERY SIMULATOR
                </div>
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                  Interactive Student Telemetry & Radar
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
                      padding: '5px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: activeDemoRisk === tier ? 'var(--accent)' : 'var(--border)',
                      background: activeDemoRisk === tier ? 'var(--accent)' : 'var(--surface-2)',
                      color: activeDemoRisk === tier ? 'white' : 'var(--text-secondary)',
                      boxShadow: activeDemoRisk === tier ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none'
                    }}
                  >
                    {tier} Risk Tier
                  </button>
                ))}
              </div>
            </div>

            {/* Simulator Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
              {/* Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>ATTENDANCE MOMENTUM</span>
                    <span style={{ color: demoAttendance < 75 ? 'var(--danger)' : 'var(--success)' }}>{demoAttendance}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={demoAttendance}
                    onChange={e => setDemoAttendance(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>CUMULATIVE GPA</span>
                    <span style={{ color: demoGpa < 6.0 ? 'var(--danger)' : 'var(--success)' }}>{demoGpa.toFixed(1)} / 10.0</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="10.0"
                    step="0.1"
                    value={demoGpa}
                    onChange={e => setDemoGpa(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ background: 'var(--surface-2)', padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                    SIMULATED OUTCOME:
                  </div>
                  <div style={{ color: demoAttendance < 70 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
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
                    <PolarGrid stroke="var(--border-strong)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <Radar name="Student Profile" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Telemetry Strip */}
      <section style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px'
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
            <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              5,000+
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
              Students Monitored
            </div>
          </div>

          <div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              87.1%
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
              Test Accuracy (5-Fold CV)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--warning)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Weeks 2–6
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
              Early Detection Window
            </div>
          </div>

          <div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--accent-purple)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              &lt; 50ms
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
              Live WebSocket Latency
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section ref={featuresRef} style={{ padding: '80px 24px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="stamp-badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', marginBottom: '8px' }}>
            INTELLIGENT CAPABILITIES
          </span>
          <h2 style={{ fontSize: '36px', color: 'var(--text-primary)', margin: '8px 0 0', fontWeight: 800 }}>
            Engineered for High-Precision Retention
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
              className="premium-card"
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontSize: '32px' }}>{card.icon}</span>
                <span className="stamp-badge" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-tertiary)' }}>
                  {card.code}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '6px' }}>
                {card.tag}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55, flex: 1 }}>
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
        borderTop: '1px solid var(--border)',
        padding: '36px 24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            EduGuard
          </span>
          <span className="stamp-badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
            SIH 2026
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Autonomous Early-Warning Student Retention Intelligence System · Built for Smart India Hackathon
        </p>
      </footer>
    </div>
  )
}
