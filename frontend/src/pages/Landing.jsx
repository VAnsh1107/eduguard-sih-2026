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
  Check
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
    { subject: 'LMS Activity', A: activeDemoRisk === 'High' ? 30 : 88 },
    { subject: 'Wellbeing', A: activeDemoRisk === 'High' ? 40 : 85 },
    { subject: 'Social', A: activeDemoRisk === 'High' ? 35 : 80 },
  ]

  const featureCards = [
    {
      icon: <Brain size={26} color="var(--accent)" />,
      badge: 'Machine Learning',
      title: 'Multivariate Risk Classification',
      desc: 'Predictive ensemble algorithms evaluate 12+ behavioral, academic, and socio-demographic indicators to detect disengagement before final examinations.'
    },
    {
      icon: <Zap size={26} color="var(--warning)" />,
      badge: 'Live Telemetry',
      title: 'Instant WebSocket Pipeline',
      desc: 'Educators and department heads receive sub-second alerts when attendance drops or assessment submission thresholds are triggered.'
    },
    {
      icon: <Activity size={26} color="var(--success)" />,
      badge: 'Interventions',
      title: 'Prescriptive Action Plans',
      desc: 'Connect at-risk students directly to peer tutoring, counseling sessions, and academic assistance with closed-loop resolution logging.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
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
      {/* Ambient Top Light Beam */}
      <div className="ambient-hero-glow" />

      {/* Top Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '54px',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            backgroundColor: 'var(--accent-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={16} color="var(--accent)" />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>EduGuard</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            height: '34px',
            padding: '0 18px',
            borderRadius: '980px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)',
            transition: 'transform 0.15s ease, background-color 0.15s ease'
          }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '120px 24px 72px',
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
          {/* Eyebrow Pill */}
          <motion.div variants={itemVariants} style={{
            fontSize: '12px',
            color: 'var(--accent)',
            backgroundColor: 'var(--accent-light)',
            border: '0.5px solid rgba(0, 113, 227, 0.2)',
            borderRadius: '980px',
            padding: '6px 16px',
            marginBottom: '28px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0, 113, 227, 0.08)'
          }}>
            <Sparkles size={13} /> Next-Generation Higher Education Retention Engine
          </motion.div>

          {/* H1 Headline */}
          <motion.h1 variants={itemVariants} style={{
            fontSize: 'clamp(40px, 5.5vw, 64px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.035em',
            lineHeight: 1.06,
            margin: '0 0 24px 0'
          }}>
            Catch dropout risk before it becomes dropout reality.
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={itemVariants} style={{
            fontSize: 'clamp(17px, 2.2vw, 20px)',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            lineHeight: 1.55,
            margin: '0 0 40px 0',
            fontWeight: 400
          }}>
            Empower educators with predictive ML intelligence, automated early-warning telemetry, and closed-loop student intervention workflows.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/login" style={{
              backgroundColor: 'var(--accent)',
              color: 'white',
              height: '46px',
              padding: '0 28px',
              borderRadius: '980px',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 113, 227, 0.28)'
            }}>
              Launch Platform <ArrowRight size={16} />
            </Link>

            <Link to="/login" style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              height: '46px',
              padding: '0 24px',
              borderRadius: '980px',
              fontSize: '15px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '0.5px solid var(--border-strong)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              Try 1-Click Demo Accounts
            </Link>
          </motion.div>
        </motion.div>

        {/* Interactive Live Platform Interactive Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            marginTop: '56px',
            width: '100%',
            maxWidth: '920px',
            borderRadius: 'var(--radius-2xl)',
            backgroundColor: 'var(--surface)',
            border: '0.5px solid var(--border-strong)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
            padding: '28px 32px',
            textAlign: 'left',
            position: 'relative'
          }}
        >
          {/* Card Topbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '8px' }}>
                Live Model Telemetry Preview
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>Model v2.4 Active</span>
            </div>
          </div>

          {/* Interactive Preview Body */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'center' }}>
            
            {/* Left: Interactive Risk Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  Simulated Student Profile
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Vivaan Yadav · <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>CS Sem 2</span>
                </div>
              </div>

              {/* Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    <span>Attendance Rate</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{demoAttendance}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={demoAttendance}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setDemoAttendance(val)
                      if (val < 65) setActiveDemoRisk('High')
                      else if (val < 80) setActiveDemoRisk('Medium')
                      else setActiveDemoRisk('Low')
                    }}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    <span>Cumulative GPA</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{demoGpa.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="0.1"
                    value={demoGpa}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setDemoGpa(val)
                      if (val < 4.5 || demoAttendance < 65) setActiveDemoRisk('High')
                      else if (val < 7.0 || demoAttendance < 80) setActiveDemoRisk('Medium')
                      else setActiveDemoRisk('Low')
                    }}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Status Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: activeDemoRisk === 'High' ? 'var(--danger-light)' : activeDemoRisk === 'Medium' ? 'var(--warning-light)' : 'var(--success-light)' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: activeDemoRisk === 'High' ? 'var(--danger)' : activeDemoRisk === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>
                  {activeDemoRisk} Risk Classification
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: activeDemoRisk === 'High' ? 'var(--danger)' : activeDemoRisk === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>
                  {activeDemoRisk === 'High' ? '91%' : activeDemoRisk === 'Medium' ? '68%' : '98%'} Confidence
                </span>
              </div>
            </div>

            {/* Right: Radar Chart Visualization */}
            <div style={{ height: 220, backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={demoRadar}>
                  <PolarGrid stroke="var(--border-strong)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Radar
                    name="Student Profile"
                    dataKey="A"
                    stroke={activeDemoRisk === 'High' ? 'var(--danger)' : 'var(--accent)'}
                    fill={activeDemoRisk === 'High' ? 'var(--danger)' : 'var(--accent)'}
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Ribbon */}
      <section style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px',
        backgroundColor: 'var(--surface)',
        borderTop: '0.5px solid var(--border)',
        borderBottom: '0.5px solid var(--border)',
        gap: '48px',
        flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>5,000+</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Active Student Profiles</div>
        </div>
        <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>12+</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Behavioral ML Features</div>
        </div>
        <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--success)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>92.4%</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Model Classification Precision</div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section ref={featuresRef} style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '96px 24px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '10px' }}>
            Built for Scale & Precision
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', margin: 0 }}>
            Everything educators need to prevent dropout.
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {featureCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="premium-card"
              style={{
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {card.icon}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {card.badge}
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '40px 24px',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: '13px',
        borderTop: '0.5px solid var(--border)',
        backgroundColor: 'var(--surface)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Shield size={16} color="var(--accent)" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>EduGuard Early Warning Platform</span>
        </div>
        <div>Built for Smart India Hackathon · Institutional AI Retention System</div>
      </footer>
    </div>
  )
}
