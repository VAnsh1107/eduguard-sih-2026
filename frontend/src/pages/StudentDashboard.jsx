import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, TrendingUp, BookOpen, Calendar, Activity, X, AlertTriangle, BookHeart, Goal, Plus, Sparkles, Trophy } from 'lucide-react'
import AppShell from '../components/AppShell'
import * as Progress from '@radix-ui/react-progress'
import * as Dialog from '@radix-ui/react-dialog'
import toast from 'react-hot-toast'
import useSocket from '../hooks/useSocket'
import { useAuth } from '../context/AuthContext'

// Helpers
function formatWeekLabel(isoDate) {
  if (!isoDate) return ''
  try {
    const date = new Date(`${isoDate}T00:00:00`)
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

const CHECKIN_FIELDS = [
  { key: 'stress_level', label: 'Study Stress', emoji: '🧠' },
  { key: 'sleep_quality', label: 'Sleep Quality', emoji: '😴' },
  { key: 'motivation', label: 'Academic Motivation', emoji: '⚡' },
  { key: 'social_support', label: 'Social & Campus Connection', emoji: '👥' },
  { key: 'physical_health', label: 'Physical Wellbeing', emoji: '🏃' },
]

function RiskGauge({ riskLevel, confidence }) {
  const color = riskLevel === 'High' ? 'var(--danger)' : riskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)'
  const percentage = confidence || 0
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="80" cy="80" r={radius} stroke="var(--border)" strokeWidth="12" fill="none" />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{Math.round(percentage)}%</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Predicted Risk Probability</div>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const studentId = user?.student_id || user?.linked_student_id || 'STU1001'

  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [assigned, setAssigned] = useState([])
  const [assignedLoading, setAssignedLoading] = useState(true)
  
  const [checkins, setCheckins] = useState([])
  const [checkinsLoading, setCheckinsLoading] = useState(true)
  
  const [goals, setGoals] = useState([])
  const [riskBanner, setRiskBanner] = useState(false)
  
  // Goal Modal State
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [newGoalType, setNewGoalType] = useState('attendance')
  const [newGoalTarget, setNewGoalTarget] = useState(85)
  const [newGoalDate, setNewGoalDate] = useState('2026-12-15')
  const [creatingGoal, setCreatingGoal] = useState(false)

  const [checkinForm, setCheckinForm] = useState({
    stress_level: 6,
    sleep_quality: 7,
    motivation: 8,
    social_support: 7,
    physical_health: 8,
  })

  const socket = useSocket()

  const fetchGoals = () => {
    axios.get('/api/me/goals').then(r => setGoals(r.data.data || r.data.goals || [])).catch(() => {})
  }

  useEffect(() => {
    if (studentId) {
      axios.get(`/api/students/${studentId}`).then(r => { setDetail(r.data); setLoading(false) }).catch(() => setLoading(false))
      axios.get(`/api/students/${studentId}/interventions`).then(r => { setAssigned(r.data.interventions || []); setAssignedLoading(false) }).catch(() => setAssignedLoading(false))
      axios.get('/api/me/checkins').then(r => { setCheckins(r.data.checkins || []); setCheckinsLoading(false) }).catch(() => setCheckinsLoading(false))
      fetchGoals()
    }
  }, [studentId])

  const handleRiskUpdate = useCallback((payload) => {
    if (payload.student_id !== studentId) return
    setDetail(prev => {
      if (!prev) return prev
      return {
        ...prev,
        prediction: {
          ...(prev.prediction || {}),
          risk_level: payload.risk_label,
          confidence: payload.risk_probability,
        },
      }
    })
    if (payload.changed && payload.risk_label === 'High') {
      setRiskBanner(true)
    }
  }, [studentId])

  useEffect(() => {
    if (!socket) return
    socket.on('risk_update', handleRiskUpdate)
    return () => socket.off('risk_update', handleRiskUpdate)
  }, [socket, handleRiskUpdate])

  async function handleSubmitCheckin(e) {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/me/checkins', checkinForm)
      setDetail(prev => prev ? { ...prev, prediction: data.prediction } : prev)
      toast.success('Weekly check-in logged! Model profile updated.')
      axios.get('/api/me/checkins').then(r => setCheckins(r.data.checkins || []))
    } catch {
      toast.error('Failed to submit check-in')
    }
  }

  async function handleCreateGoal(e) {
    e.preventDefault()
    setCreatingGoal(true)
    try {
      await axios.post('/api/me/goals', {
        goal_type: newGoalType,
        target_value: Number(newGoalTarget),
        end_date: newGoalDate
      })
      toast.success('New goal created!')
      setGoalModalOpen(false)
      fetchGoals()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create goal')
    } finally {
      setCreatingGoal(false)
    }
  }

  const s = detail || {}
  const pred = s.prediction || {}
  const confidence = pred.risk_probability ?? pred.confidence ?? s.risk_probability ?? null
  const riskLevel = confidence !== null
    ? (confidence >= 70 ? 'High' : confidence >= 40 ? 'Medium' : 'Low')
    : (pred.risk_level || s.risk_label || 'Low')
  const factors = pred.top_factors || []

  // Performance Profile Radar Data (0-100 normalized)
  const calcRadarScore = (val, maxVal = 1, isPct = false) => {
    if (val == null) return 0
    const num = Number(val)
    if (isNaN(num)) return 0
    if (isPct) {
      return num > 1 ? Math.min(100, Math.round(num)) : Math.min(100, Math.round(num * 100))
    }
    return Math.min(100, Math.round((num / maxVal) * 100))
  }

  const radarData = [
    { subject: 'GPA', A: calcRadarScore(s.gpa, 10), raw: s.gpa != null ? Number(s.gpa).toFixed(2) : 'N/A' },
    { subject: 'Attendance', A: calcRadarScore(s.attendance_rate, 1, true), raw: `${calcRadarScore(s.attendance_rate, 1, true)}%` },
    { subject: 'Assignments', A: calcRadarScore(s.assignment_submission_rate, 1, true), raw: `${calcRadarScore(s.assignment_submission_rate, 1, true)}%` },
    { subject: 'LMS Activity', A: calcRadarScore(s.lms_login_frequency ?? s.lms_logins_week, 20), raw: `${s.lms_login_frequency ?? s.lms_logins_week ?? 0}/wk` },
    { subject: 'Wellbeing', A: calcRadarScore(s.mental_health_score ?? s.mental_wellbeing_score, 10), raw: `${s.mental_health_score ?? s.mental_wellbeing_score ?? 0}/10` },
    { subject: 'Engagement', A: calcRadarScore(s.extracurricular_participation ?? s.extracurricular, 1), raw: s.extracurricular_participation ? 'Active' : 'Basic' },
  ]

  const riskColor = riskLevel === 'High' ? 'var(--danger)' : riskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)'
  const riskExplanation = riskLevel === 'High'
    ? 'Our predictive models have identified indicators that require immediate academic support. Please review recommended counselor interventions below.'
    : riskLevel === 'Medium'
    ? 'You are maintaining solid performance with a few key focus areas. Boosting attendance and LMS activity can improve your standing.'
    : 'Excellent standing! You are consistently on track across academic and engagement dimensions.'

  // Weekly Wellbeing Chart Data
  const hasCheckedIn = checkins && checkins.length > 0
  const latestCheckin = hasCheckedIn ? checkins[0] : null
  const thisWeekBarData = latestCheckin ? [
    { label: 'Stress', value: latestCheckin.stress_level },
    { label: 'Sleep', value: latestCheckin.sleep_quality },
    { label: 'Motivation', value: latestCheckin.motivation },
    { label: 'Social', value: latestCheckin.social_support },
    { label: 'Health', value: latestCheckin.physical_health },
  ] : []

  const rawTrend = (checkins || []).slice(0, 8).reverse().map(c => ({
    week: formatWeekLabel(c.week_start) || 'This Wk',
    score: c.overall_score || Math.round(((c.stress_level || 5) + (c.sleep_quality || 5) + (c.motivation || 5) + (c.social_support || 5) + (c.physical_health || 5)) / 5)
  }))
  const checkinTrendData = rawTrend.length === 1 ? [{ week: 'Baseline', score: rawTrend[0].score }, rawTrend[0]] : rawTrend

  // Deduplicate goals by type/title
  const rawGoals = goals && goals.length > 0 ? goals : []
  const seenGoalTypes = new Set()
  const displayGoals = rawGoals.filter(g => {
    const key = g.goal_type || g.title || g.label
    if (seenGoalTypes.has(key)) return false
    seenGoalTypes.add(key)
    return true
  })

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 32px 64px' }}
      >
        {/* Escalation Banner */}
        <AnimatePresence>
          {riskBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                backgroundColor: 'var(--danger-light)',
                border: '0.5px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={20} color="var(--danger)" />
                <span style={{ color: 'var(--danger)', fontSize: '14px', fontWeight: 600 }}>
                  Early-Warning Alert: Your risk classification has escalated to High. Review counselor recommendations below.
                </span>
              </div>
              <button onClick={() => setRiskBanner(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Greeting */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '11px', textTransform: 'uppercase', tracking: '0.08em', fontWeight: 700,
            color: 'var(--accent)', backgroundColor: 'var(--accent-light)', display: 'inline-block',
            padding: '3px 10px', borderRadius: '980px', marginBottom: '8px'
          }}>
            Student Academic Hub
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Welcome back, {s.name || user?.name || 'Student'}.
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {s.department || 'Mechanical Eng.'} · Semester {s.semester || s.year || 2} · <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{studentId}</span>
          </div>
        </div>

        {/* RISK STATUS FEATURED CARD */}
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-card)',
          border: '0.5px solid var(--border)',
          padding: '32px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div style={{ flex: '0 0 160px', display: 'flex', justifyContent: 'center' }}>
            <RiskGauge riskLevel={riskLevel} confidence={confidence} />
          </div>

          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '980px',
                backgroundColor: riskLevel === 'High' ? 'var(--danger-light)' : riskLevel === 'Medium' ? 'var(--warning-light)' : 'var(--success-light)',
                color: riskColor, textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                {riskLevel} Risk Standing
              </span>
              {confidence !== null ? (
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '980px', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '0.5px solid var(--border)' }}>
                  {Math.round(confidence)}% Risk Probability
                </span>
              ) : (
                <span style={{ fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '980px', backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                  Probability unavailable
                </span>
              )}
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
              {riskExplanation}
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {factors.slice(0, 3).map((factor, i) => (
                <div key={i} style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '980px',
                  backgroundColor: factor.direction === 'increases risk' ? 'var(--danger-light)' : 'var(--success-light)',
                  color: factor.direction === 'increases risk' ? 'var(--danger)' : 'var(--success)',
                  fontWeight: 600
                }}>
                  {factor.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TWO-COLUMN GRID: Performance Radar & Goals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* PERFORMANCE RADAR */}
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Performance Radar Profile
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>6-Axis Academic & Behavioral Telemetry</div>
              </div>
            </div>
            
            <div style={{ height: '240px', marginBottom: '18px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Student Profile" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {radarData.map(m => (
                <div key={m.subject} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '90px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{m.subject}</div>
                  <Progress.Root style={{ flex: 1, height: '8px', backgroundColor: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }} value={m.A}>
                    <Progress.Indicator style={{ width: `${m.A}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.5s ease' }} />
                  </Progress.Root>
                  <div style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {m.raw}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GOALS CARD */}
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Personal Targets
                </h3>
              </div>
              <button
                onClick={() => setGoalModalOpen(true)}
                style={{
                  fontSize: '12px', padding: '5px 12px', borderRadius: '980px', backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Plus size={13} /> Set Goal
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {displayGoals.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No target goals set yet. Click "+ Set Goal" to track attendance or GPA targets!
                </div>
              ) : displayGoals.map((g, i) => {
                const current = g.current_value ?? g.value ?? 0
                const target = g.target_value ?? g.target ?? 100
                const pct = g.progress_pct || Math.min(100, Math.round((current / (target || 1)) * 100))
                const isGpa = (g.goal_type === 'gpa') || (g.title || '').toLowerCase().includes('gpa')
                const isPctMetric = (g.goal_type === 'attendance' || g.goal_type === 'assignment') || (g.title || '').toLowerCase().includes('rate') || (g.title || '').toLowerCase().includes('submission')

                let formattedVal = `${current} / ${target}`
                if (isGpa) {
                  formattedVal = `${Number(current).toFixed(2)} / ${Number(target).toFixed(1)} GPA`
                } else if (isPctMetric) {
                  formattedVal = `${Math.round(current)}% / ${Math.round(target)}%`
                }

                return (
                  <div key={i} style={{ backgroundColor: 'var(--surface-2)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{g.title || g.label || g.goal_type?.toUpperCase()}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                        {g.isStreak ? `${current} wks streak` : formattedVal}
                      </div>
                    </div>
                    {!g.isStreak ? (
                      <Progress.Root style={{ height: '6px', backgroundColor: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }} value={pct}>
                        <Progress.Indicator style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.5s ease' }} />
                      </Progress.Root>
                    ) : (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div key={j} style={{ height: '6px', flex: 1, backgroundColor: j < current ? 'var(--accent)' : 'var(--surface)', borderRadius: '3px' }} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* WEEKLY WELLBEING CHECK-IN CARD */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--border)', marginBottom: '24px' }}>
          {!hasCheckedIn ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Weekly Wellbeing & Engagement Check-in
                </h3>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', backgroundColor: 'var(--accent-light)', padding: '3px 10px', borderRadius: '980px' }}>
                  Pending This Week
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>
                Your responses directly tune the institutional support algorithms to ensure timely assistance.
              </p>

              <form onSubmit={handleSubmitCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
                {CHECKIN_FIELDS.map(field => (
                  <div key={field.key} style={{ backgroundColor: 'var(--surface-2)', padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{field.emoji}</span> {field.label}
                      </label>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                        {checkinForm[field.key]} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1" max="10" step="1"
                      value={checkinForm[field.key]}
                      onChange={e => setCheckinForm(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                  </div>
                ))}
                <button type="submit" style={{ padding: '12px 28px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '980px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start', boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)' }}>
                  Submit Weekly Check-in
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 700, fontSize: '15px' }}>
                  <CheckCircle size={20} /> Weekly Check-in Complete
                </div>
                <button
                  onClick={() => setCheckins([])}
                  style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Update Check-in
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.04em' }}>
                    This Week's Breakdown
                  </h4>
                  <div style={{ height: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={thisWeekBarData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" domain={[0, 10]} hide />
                        <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-sm)' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                          {thisWeekBarData.map((e, i) => <Cell key={i} fill="var(--accent)" />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.04em' }}>
                    8-Week Wellbeing Trend
                  </h4>
                  <div style={{ height: '180px' }}>
                    {checkinTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={checkinTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="week" axisLine={{ stroke: 'var(--border)' }} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                          <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }} />
                          <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--surface)', stroke: 'var(--accent)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                        No check-in trend data logged yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MY INTERVENTIONS CARD */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Allocated Support Programs ({assigned.length})
          </h3>
          
          {assigned.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Activity size={32} opacity={0.4} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>No active intervention plans</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>You're in good standing. Keep up the consistent progress!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assigned.map((inv, i) => {
                const color = inv.status === 'pending' ? 'var(--warning)' : inv.status === 'active' ? 'var(--accent)' : 'var(--success)'
                return (
                  <div key={i} style={{ padding: '14px 18px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Assigned: {new Date(inv.assigned_at).toLocaleDateString()}</div>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '980px',
                        backgroundColor: inv.status === 'resolved' ? 'var(--success-light)' : 'var(--accent-light)',
                        color: inv.status === 'resolved' ? 'var(--success)' : 'var(--accent)', textTransform: 'capitalize'
                      }}>
                        {inv.status}
                      </span>
                    </div>
                    {inv.notes && (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.45 }}>
                        {inv.notes}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </motion.div>

      {/* Goal Setting Dialog Modal */}
      <Dialog.Root open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', zIndex: 9998 }} />
          <Dialog.Content style={{
            position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: '440px', backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-xl)', padding: '28px', zIndex: 9999, outline: 'none',
            boxShadow: 'var(--shadow-lg)', border: '0.5px solid var(--border-strong)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Set Academic Target</h3>
              </div>
              <Dialog.Close asChild>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Goal Metric</label>
                <select
                  value={newGoalType}
                  onChange={e => setNewGoalType(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', padding: '0 10px', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
                >
                  <option value="attendance">Attendance Target (%)</option>
                  <option value="gpa">GPA Target (0-10)</option>
                  <option value="assignment">Assignment Completion (%)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Target Value</label>
                <input
                  type="number"
                  step={newGoalType === 'gpa' ? '0.1' : '1'}
                  max={newGoalType === 'gpa' ? '10' : '100'}
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', padding: '0 10px', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Target Completion Date</label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={e => setNewGoalDate(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', padding: '0 10px', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={creatingGoal}
                style={{
                  height: '42px', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '980px',
                  border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginTop: '8px',
                  boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)'
                }}
              >
                {creatingGoal ? 'Saving...' : 'Create Target'}
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AppShell>
  )
}
